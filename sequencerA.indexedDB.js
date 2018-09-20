$( document ).ready(function() {
       
        "use strict";

        const DB_NAME="sequencerA";
        const DB_VERSION=1;

        var request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = function(event) {
            sweetAlert("Something wrong with IndexedDB. Could be that existing version greater than "+DB_VERSION);
            return;
        };

        var db;

        request.onsuccess = function(event) {
            console.log("indexedDB - Opened successfully");
            db=event.target.result;
            $("#version").text(DB_VERSION);
            getObjectStore("blobs","readonly").openCursor().onsuccess = function(e) {
                let cursor=e.target.result;
                if(cursor) {
                    if (cursor.value.name=="SequencerA_logo") {
                        $("#logo").attr("src",URL.createObjectURL(cursor.value.data));
                    } else if (cursor.value.num==1) {
                        project.sounds.push({name:cursor.value.name, mute:false, single:false, volume:0.5, stereo: 0.0, format: "wav", id: cursor.value.id, 
                                             sequence:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]});
                        hSounds.push(new Howl({format: cursor.value.type, volume: 0.5, src: URL.createObjectURL(cursor.value.data), stereo: 0.0}));
                    }
                    cursor.continue();
                }
            }
            db.onerror=function(e) {
                sweetAlert("Database error: " + e.target.errorCode);
            };
        };
      
        function getObjectStore(store_name, mode) {
            var tx=db.transaction(store_name, mode);
            return tx.objectStore(store_name);
        }

        // onupgradeneeded - create object stores and any indexes
        request.onupgradeneeded = function(e) {
            console.log("Starting onupgradeneeded");
            var db=e.target.result;
            
            db.onerror=function(e) {
                console.log("Error loading database in onupgradeneeded: " + e.target.errorCode);
            };        
            
            // load contents of file into indexedDB "blobs" store
            function loadFile2DB(file) {
                console.log("Starting loadZip2DB");
                var xhr = new XMLHttpRequest();
                xhr.open('GET', file, true);
                xhr.responseType = 'blob';
                xhr.onload = function(e) {
                    if (this.status == 200) {
                        if (file.match(/zip$/)=="zip") {
                            JSZip.loadAsync(this.response).then(function(zip) {
                                 zip.forEach(function (relativePath, zipEntry) {
                                     zip.files[relativePath].async('blob').then(function(data) {
                                         putBlob(zipEntry.name, data);
                                     }); 
                                 });
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
                db.transaction("blobs","readwrite").objectStore("blobs").put({name:name, type:type, num:num, data:data}).onsuccess=function(e) {
                    db.transaction("blobs","readonly").objectStore("blobs").get(e.target.result).onsuccess=function(e) {
                        let result=e.target.result;
                        let objectUrl=URL.createObjectURL(result.data);
                        console.log("Inserted successfully - "+result.name+" (id:"+result.id+")");
                        if (result.name=="SequencerA_logo") {
                            console.log("Assigning src to logo");
                            $("#logo").attr("src",objectUrl);
                        } else if (result.num==1) {
                            project.sounds.push({name:result.name, mute:false, single:false, volume:0.5, stereo: 0.0, format: result.type, id: result.id, 
                                             sequence:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]});
                            hSounds.push(new Howl({format: result.type, volume: 0.5, src: objectUrl, stereo: 0.0}));
                        }
                    }
                }
            }            

            if (!db.objectStoreNames.contains("blobs")) {
                db.createObjectStore("blobs", { keyPath: "id", autoIncrement: true }).createIndex("name","name", {unique:true});
                loadFile2DB('https://cdn.rawgit.com/xsf3190/sequencerA/master/sounds1.zip');
            }
            if (!db.objectStoreNames.contains("sequences")) {
                db.createObjectStore("sequences", { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("chains")) {
                db.createObjectStore("chains", { autoIncrement: true });
            }
        }
      


    
    // Create pop-up dialog for SAVE, LOAD etc
    /*
    var popup=$('#popup-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: 620,
        height: 350,
        open: function (event, ui) {
        },
        close: function (event, ui) { 
        }
    });
    */

});
