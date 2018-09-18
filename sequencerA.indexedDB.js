$( document ).ready(function() {
       
        "use strict";

        const DB_NAME="sequencerA";
        const DB_VERSION=1;

        var request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = function(event) {
            sweetAlert("Why didn't you allow my web app to use IndexedDB?");
            return;
        };

        var db;

        request.onsuccess = function(event) {
            console.log("indexedDB.open - success");
            db = event.target.result;
            $("#version").text(DB_VERSION);
            getObjectStore("blobs","readonly").openCursor().onsuccess = function(e) {
                let cursor=e.target.result;
                if(cursor) {
                    if (cursor.value.name=="sequencerA.jpg") {
                        $("#logo").attr("src",URL.createObjectURL(cursor.value.data));
                    } else if (cursor.value.num==1) {
                        project.sounds.push({name:cursor.value.name, mute:false, single:false, volume:0.5, stereo: 0.0, format: "wav", id: cursor.value.id, 
                                             sequence:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]});
                        hSounds.push(new Howl({format: "wav", volume: 0.5, src: URL.createObjectURL(cursor.value.data), stereo: 0.0}));
                    }
                    cursor.continue();
                }
            }
        };
    
        // Generic error handler for all errors targeted at this database's requests!
        if (db) {
            db.onerror = function(event) {
                sweetAlert("Database error: " + event.target.errorCode);
            };
        };
      
        function getObjectStore(store_name, mode) {
            var tx = db.transaction(store_name, mode);
            return tx.objectStore(store_name);
        }

        // onupgradeneeded - create object stores and any indexes
        request.onupgradeneeded = function(event) {
            console.log("Starting onupgradeneeded");
            var db = event.target.result;

            db.onerror = function(event) {
                console.log("Error loading database: " + event.target.errorCode);
            };

            var objectStore=db.createObjectStore("blobs", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("name","name", {unique:true});
            db.createObjectStore("sequences", { autoIncrement: true });
            db.createObjectStore("chains", { autoIncrement: true });

            loadFile2DB('https://cdn.rawgit.com/xsf3190/sequencerA/master/sounds1.zip');
            loadFile2DB('https://cdn.rawgit.com/xsf3190/sequencerA/master/sequencerA.jpg');
        }
      
        // load contents of file resource into indexedDB
        function loadFile2DB(file) {
            console.log("Starting loadZip2DB");
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file, true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                if (this.status == 200) {
                    let pos=file.lastIndexOf("/"),
                        filename=file.substring(pos+1),
                        filetype=filename.substring(filename.indexOf(".")+1),
                        num=parseInt(filename.match(/\d+/),10);
                    if (filetype==="zip") {
                        JSZip.loadAsync(this.response).then(function(zip) {
                             zip.forEach(function (relativePath, zipEntry) {
                                 zip.files[relativePath].async('blob').then(function(data) {
                                     getObjectStore("blobs","readwrite").put({name: zipEntry.name, num: num, data: data}).onsuccess=function(e) {
                                         console.log("added sound file - "+e.target.result);
                                     }
                                 }); 
                             });
                        });
                    } else {
                        let blob=this.response;
                        getObjectStore("blobs", 'readwrite').put({name: filename, data: blob}).onsuccess=function(e) {
                            let id=e.target.result;
                            console.log(id);
                            getObjectStore("blobs", 'readonly').get(id).onsuccess=function(e) {
                                let result=e.target.result;
                                console.log(result.name);
                                let imgURL=URL.createObjectURL(result.data);
                                console.log(imgURL);
                                $("#logo").attr("src",imgURL);
                            }
                        }
                    };
                };
            };
            xhr.send();
        };
    
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
