// GLOBAL VARIABLES
var db;
var sequenceLength=32;
var project={bpm:120, sounds:[]};
var hSounds=[];

var interval = null;
var pos=0;
var chains=[];
var chains_pos=0;    


$( document ).ready(function() {
       
    "use strict";

    const DB_NAME="sequencerA";
    const DB_VERSION=1;

    var request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = function(event) {
        sweetAlert("Something wrong with IndexedDB. Could be that existing version greater than "+DB_VERSION);
        return;
    };

    var dbReady=Promise.resolve(1);
    var ajaxReady;

    request.onsuccess = function(event) {
        dbReady.then(()=>{
            console.log("dbReady promise fulfilled -  indexedDB opened successfully");
            db=event.target.result;
            $("#version").text(DB_VERSION);
            db.transaction("images","readonly").objectStore("images").openCursor().onsuccess = function(e) {
                let cursor=e.target.result;
                if (cursor) {
                    $("#logo").attr("src",URL.createObjectURL(cursor.value.data));
                    cursor.continue();
                }
            }
            
            let row=-1;
            let tbody="<tbody>";
            db.transaction("sounds","readonly").objectStore("sounds").openCursor().onsuccess = function(e) {
                let cursor=e.target.result;
                if(cursor) {
                    if (cursor.value.num==1) {
                        row++;
                        tbody+=addSound(row, cursor.value.id, cursor.value.name, cursor.value.type, cursor.value.data);
                    }
                    cursor.continue();
                } else {
                    tbody+="</tbody>";
                    $("tbody").replaceWith(tbody);
                }
            }
            db.onerror=function(e) {
                sweetAlert("Database error: " + e.target.errorCode);
            };
        });
    };

    // onupgradeneeded - create object stores and any indexes
    request.onupgradeneeded = function(e) {
        dbReady=new Promise(function(resolve,reject) {
            console.log("About to ajaxReady=resolve");
            ajaxReady=resolve;
        });
        console.log("Starting onupgradeneeded");
        var db=e.target.result;
        
        db.onerror=function(e) {
            console.log("Error loading database in onupgradeneeded: " + e.target.errorCode);
        };        
        
        // load contents of downloaded zip file into indexedDB stores
        function loadFile2DB(file) {
            console.log("Starting loadZip2DB");
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file, true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                if (this.status == 200) {
                    if (file.match(/zip$/)=="zip") {
                        JSZip.loadAsync(this.response).then(function(zip) {
                            let allBlobPromises=[];
                            zip.forEach(function (relativePath, zipEntry) {
                                console.log("About to push "+zipEntry.name+" to allBlobPromises");
                                allBlobPromises.push(
                                    zip.files[relativePath].async('blob').then(function(data) {
                                        putBlob(zipEntry.name, data);
                                    }, function error(e) {
                                        console.log(e); 
                                    })
                                );
                            });
                            console.log("About to Promise.all(allBlobPromises)");
                            Promise.all(allBlobPromises).then(()=>ajaxReady(1));
                        });
                    } else {
                        let pos=file.lastIndexOf("/");
                        putBlob(file.substring(pos+1), this.response);
                    };
                };
            };
            xhr.send();
        };

        function putBlob(filename, data) {
            let type=filename.substring(filename.indexOf(".")+1),
                name=filename.substring(0,filename.indexOf(".")),
                num=parseInt(name.match(/\d+/),10);
            if (type=="jpeg") {
                db.transaction("images","readwrite").objectStore("images").put({name:name, type:type, data:data}).onsuccess=function(e) {
                    $("#logo").attr("src",URL.createObjectURL(data));
                    console.log("Image inserted successfully - "+filename);
                }                
            } else {
                db.transaction("sounds","readwrite").objectStore("sounds").put({name:name, type:type, num:num, data:data}).onsuccess=function(e) {
                    console.log("Sound inserted successfully - "+filename);
                }
            }
        }            

        if (!db.objectStoreNames.contains("sounds")) {
            db.createObjectStore("sounds", { keyPath: "id", autoIncrement: true })
              .createIndex("name","name", {unique:true});
        }        
        if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
        }        
        if (!db.objectStoreNames.contains("projects")) {
            let projects=db.createObjectStore("projects", { keyPath: "id", autoIncrement: true });
            projects.createIndex("name","name", {unique:true});
            projects.createIndex("abbr","abbr", {unique:true});
            projects.createIndex("last_modified_unix","last_modified_unix", {unique:false});
        }    

        loadFile2DB('https://cdn.rawgit.com/xsf3190/sequencerA/master/sounds1.zip');
    }

    // Build next sound in both object and DOM
    function addSound(row, id, name, type, data) {
        let objectURL=URL.createObjectURL(data);

        project.sounds.push({
            name:name, 
            mute:false, 
            single:false, 
            volume:0.5, 
            stereo:0.0, 
            format:type, 
            id:id, 
            sequence:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]
        });
        hSounds.push(new Howl({format:type, volume:0.5, src:objectURL, stereo:0.0}));     
        
        let tr='<tr data-y="'+row+'">';

        tr+='<td class="btn-sound" id="sound'+row+'" data-help="Click to change sample.">'+name+'</td>';
        tr+='<td class="centre"><button type="button" class="btn-single" data-help="Solo button: only play channels with S selected.">S</button>';
        tr+='<button type="button" class="btn-mute" data-help="Mute button: turn off audio for channels with M selected.">M</button></td>';
        tr+='<td><div data-help="Volume of channel: Left = 0 / Right = 10."><label for="volume0">V</label><input class="btn-volume" id="volume0" type="range" min="0" max="1" step="0.1"></div>';
        tr+='<div data-help="Panning of channel: Left/Right."><label for="stereo0">P</label><input class="btn-pan" id="stereo0" type="range" min="-1" max="1" step="0.1"></div></td>';
        let darker=false;
        for (let j=0; j<sequenceLength; j++) {
            if (j%4==0) {
                darker=!darker;
            }
            if (darker) {
                tr+='<td class="darker">';
            } else {
                tr+='<td>';
            }
            tr+='<button type="button" class="cell" data-x="'+j+'"></button></td>';
        }
        
        [1,2,3,4].forEach(function(i) {
            if (row%2==0 && row<8) {
                let slot=row*2+i; // row=0 => 1,2,3,4  row=2 => 5,6,7,8   row=4 => 9,10,11,12 ...
                tr+='<td class="chain" rowspan="2"><div class="dropnum" id="dropnum_'+slot+'"><span class="fa fa-cube"></span>'+slot+'</div><div class="dropto" id="dropto_'+slot+'"></div></td>';
            } /*else {
                tr+='<td class="chain"></td>';
            }
               */
        })
        
        tr+='</tr>';    
        return tr;
    }

});
