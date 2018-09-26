$(function() {

    "use strict";
    
    var currentChain={"key":0,"name":""};
    var currentSequence={"key":0,"name":""};

    //Click sample to open library & replace
    $(".btn-sound").on("click",function() {
        let html='';
        //let title=$("#ui-id-1");
        
        html+='<div id="sampleContainer">';
        html+='<table id="categoryContainer">';
        
        for (i in sounds) {
            let name=sounds[i].name;
            let sampleCat='<tr><td class="categoryBox">'+name+'</td></tr>';
            if (sounds) {
                $("#categoryContainer").append(html+=sampleCat);
            }
        }
        
        html+='</table>';
        html+='<table id="singleContainer">';
        
        $("body").on("click",".categoryBox",function() {
            $("#singleContainer").empty();
            
            let thisID=$(this).text();
            
            for (i in sounds) {
                let soundsI=sounds[i].name;
                if (soundsI==thisID) {
                    let category=sounds[i];
                    let items=category.items;
                    console.log(items);
                    for (i in items) {
                        if (sounds) {
                            let sampleName=items[i].name;
                            let sampleSingle='<tr><td class="singleBox">'+sampleName+'</td></tr>';
                            $("#singleContainer").append(sampleSingle);
                            console.log(sampleName);
                        }
                    }
                }
            }
        });
        
        /*
        $("body").on("click",".singleBox",function() {
            let selected='';
        
            if ($(this).hasClass("singleBox")) {
                selected=$(this).text();
            } else {
                selected='';
            }
        });
        */
        
        html+='</table>';
        html+='</div>'; //sampleContainer end
        
        /*
        title.empty();
        title.append("Replace "+$(this).text()+" with: "+selected);
        title.append('<span id="okay">OK</span>');
        */
        
    popup.html(html);     
    popup.dialog('open');
    });
    
    // Import zip file button
    $("#btn-import").on("click", function(){
        $("#importfile").trigger("click");
    });
    
    // Clear chain button     bug
    $("#ht2").on("click", function clearChain() {
        $(".fa-times").trigger("click");
        if ($(".dropto").hasClass("dropto-grey")) {
            sweetAlert({
                title: "Remove all sequences from current chain?",
                text: "This will not delete sequences permanently.",
                icon: "warning",
                buttons: true,
                dangerMode: true
            })
            .then((willClear) => {
                if (willClear) {
                    $(".fa-times").trigger("click");
                }
            });
        } else {
            $(".fa-times").trigger("click");
        }
    });
    
    fillDragfrom();
    
    $("body").on("dragstart",".chain-btn, .dragAbbr-btn, .chain-item",function(event) {
        dragStart(event);
    });
    $("body").on("dragend",".dragAbbr-btn, .chain-item",function(event) {
        dragEnd(event);
    });
    $(".dropto").on("dragenter",function(event) {
        dragEnter(event);
    });
    $(".dropto").on("dragover",function(event) {
        dragOver(event);
    });  
    $(".dropto").on("dragleave",function(event) {
        dragLeave(event);
    });      
    $(".dropto").on("drop",function(event) {
        drop(event);
    });    
    
    /* Draggable event handlers */
    function dragStart(event) {
        console.log("starting dragStart:"+event.target.id);
        event.dataTransfer.setData("text/plain", event.target.id);
    }

    function dragEnd(event) {
    }

    /* Drop target event handlers */
    function dragEnter(event) {
    }

    function dragOver(event) {
        event.preventDefault();
        return false;
    }

    function dragLeave(event) {
    }

    function drop(event) {
        let key = event.dataTransfer.getData('text/plain');
        let tgt=$(event.currentTarget);
        let indx=existsIndex("key",key);
        let tgtKey=tgt.children(".chain-item").data("key");
        for (i in projectIndex) {
            if (tgtKey==projectIndex[i].key) {
                var tgtSeq=projectIndex[i];
            }
        }
        console.log(tgtSeq);                                    //bug
        if (projectIndex[indx].chain.length==0) {
            if (tgt.hasClass("dropto-grey")) {
                 sweetAlert({
                title: "Replace sequence in chain?",
                text: "",    //bug
                icon: "warning",
                buttons: true,
                dangerMode: true
            })
                .then((willReplace) => {
                    if (willReplace) {
                        tgt.empty();
                        tgt.append('<span data-key="'+key+'" id="'+key+'" class="chain-item" draggable="true">'+projectIndex[indx].abbr+'</span><span class="fa fa-times" title="Remove from Chain"></span><span class="fa fa-refresh" title="Loop/ Edit Sequence"></span>');
                        loadSequence(key,false);
                        event.preventDefault();
                    }
                })
            } else {
            tgt.empty();
            tgt.append('<span data-key="'+key+'" id="'+key+'" class="chain-item" draggable="true">'+projectIndex[indx].abbr+'</span><span class="fa fa-times" title="Remove from Chain"></span><span class="fa fa-refresh" title="Loop/ Edit Sequence"></span>');
            loadSequence(key,false);
            event.preventDefault();
            $(".dropto").removeClass("dropto-orange");
            $(".dropnum").removeClass("dropnum-white");
            tgt.addClass("dropto-grey dropto-orange");
            tgt.prev($(".dropnum")).addClass("dropnum-white dropnum-full");
            }
        } else {
            if ($(".dropto").hasClass("dropto-grey")) {
                sweetAlert("Clear current chain and load '"+projectIndex[indx].name+"' ?");
                $(".fa-times").trigger("click");
                loadChain(indx);
            } else {
                loadChain(indx);
            }
        }
    }
    
    function loadSequence(key,cellEnabled) {
        clear.trigger("click");
        project=JSON.parse(localStorage.getItem(key));
        if (!project) {
            sweetAlert("SEQUENCE NOT LOADED FOR KEY :"+key+":");
            return;
        }
        // Set element properties in DOM based on sequence data loaded from localStorage
        bpm.text(project.bpm);
        for (i in project.sounds) {
            $("#sound"+i).text(project.sounds[i].name);
            $("#volume"+i).val(project.sounds[i].volume);
            $("#stereo"+i).val(project.sounds[i].stereo);
            hSounds[i]=new Howl({format: project.sounds[i].format, volume: project.sounds[i].volume, src: "", stereo: project.sounds[i].stereo});
            for (let j=0; j<sequenceLength; j++) {
                if (project.sounds[i].sequence[j]) {
                    $("tr[data-y="+i+"]").find("[data-x="+j+"]").addClass("selected");
                }
            }
        }
        if (cellEnabled) {
            $(".cell").prop("disabled",false);
            currentSequence.key=key;
            currentSequence.name=projectIndex[existsIndex('key',key)].name;
        } else {
            $(".cell").prop("disabled",true);
        }
    }
    
    // Load chain sequences into RHS panel making the first sequence current
    function loadChain(indx) {
        let chainname=projectIndex[indx].name;
        let chain=projectIndex[indx].chain;
        let tgt="";
        let key="";
        let xSequence="";
        for (j in chain) {
            tgt=$("#"+chain[j].slot);
            key=chain[j].key;
            // Get the array index of projectIndex for next sequence in the chain
            xSequence=existsIndex("key",key);
            tgt.append('<span data-key="'+key+'" id="'+key+'" class="chain-item" draggable="true">'+projectIndex[xSequence].abbr+'</span><span class="fa fa-times" title="Remove from Chain"></span><span class="fa fa-refresh" title="Loop/ Edit Sequence"></span>');
            if (j==0) {
                tgt.addClass("dropto-grey dropto-orange");
                tgt.prev($(".dropnum")).addClass("dropnum-white dropnum-full");  
                loadSequence(key,false);
            } else {
                tgt.addClass("dropto-grey");
            }
        }
        currentChain.key=projectIndex[indx].key;
        currentChain.name=chainname;
    }
    
    // User clicks on chain element
    $("body").on("click",".chain-item",function(){
        let that=$(this);
        let key=that.data("key");
        $(".dropto").removeClass("dropto-orange");
        $(".dropnum").removeClass("dropnum-white");
        that.parent($(".dropto")).addClass("dropto-orange");
        that.parent().prev($(".dropnum")).addClass("dropnum-white dropnum-full");
        if (that.parent($(".dropto")).hasClass("yellow") && that.parent($(".dropto")).hasClass("dropto-orange")) {
            loadSequence(key,true);
        } else {
            loadSequence(key,false);
        }
    });
    
    // Click refresh button to open sequence for edit
    $("body").on("click",".fa-refresh",function() {
        let that=$(this).parent();
        //bug
        if (that.hasClass("yellow")) {
            that.removeClass("yellow");
            $(".cell").prop("disabled",true);
            project.sequencekey=0;
            return;
        }
        $(".yellow").removeClass("yellow");
        that.addClass("yellow");
        if (that.hasClass("dropto-orange")) {
            $(".cell").prop("disabled",false);
        } else {
            $(".cell").prop("disabled",true);
        }
    });

    // Remove sequence from chain
    $("body").on('click','.fa-times', function(){
        let that=$(this).parent();
        if (that.hasClass("dropto-orange") || that.hasClass("yellow")) {
            clear.trigger("click");
        }
        that.empty().removeClass("dropto-grey dropto-orange yellow");
        that.prev($(".dropnum")).removeClass("dropnum-white dropnum-full");
    });
    
    // Sort on table column heading
    $("body").on('click', '.fa-sort-asc, .fa-sort-desc', function(){
        let classname=this.className;
        let sortdir=classname.substring(classname.lastIndexOf("-")+1);
        $("body").find("#popup-table tbody").replaceWith(listProject($(this).data("sortby"),sortdir));
        $(this).toggleClass("fa-sort-asc fa-sort-desc");
    });    
    
   // Help box stuff
    var help = $("#help-text");
    help.addClass("help-default");
    
    var save = $("#btn-save");
    var load = $("#btn-load");
    var clear = $("#btn-clear");
    var play = $("#start-stop"),
        icon = play.find("span");
    var bpm = $("#bpm");
    var reset = $("#reset");
    var dragBtn = $(".dragAbbr-btn");
    var ht2 = $("#meter td:last-child");
    var dropto = $(".dropto");
    
    $("body").on("change",".btn-volume, .btn-pan",function() {
        let that = $(this);
        let btn=this.className;
        let y=that.closest("tr").data("y");
        let value=parseFloat(that.val());

        if (btn=="btn-volume") {
            project.sounds[y].volume=value;
            hSounds[y].volume(value);
        }
        
        if (btn=="btn-pan") {
            project.sounds[y].stereo=value;
            hSounds[y].stereo(value);
        }
    });

    function resetCurrent() {
        $(".current").removeClass("current");
        $("#meter").find("[data-x=0]").addClass("current");
        pos = 0;
    }
        
    $("#reset").click(function () {
        resetCurrent();
    });
    
    // Export all saved sequences (and chains) into zip file for user to download
    $("body").on("click","#exportall",function() {
        for (i in projectIndex) {
            if (i==0) {
                var zip = new JSZip();
            }
            zip.file(projectIndex[i].name+".json", localStorage.getItem(projectIndex[i].key));
        }
        zip.generateAsync({type:"blob"})
        .then(function(content) {  
            saveAs(content, "mysequences.zip");
        });
    })
    
    // Import one or more zip files containing exported sequences
    $("body").on("change","#importfile",function(evt) {  
        const now=new Date();
        var key=Math.round(now.getTime() / 1000);          
        function handleFile(f) {     
            JSZip.loadAsync(f)                                   // 1) read the zip file
            .then(function(zip) {
                zip.forEach(function (relativePath, zipEntry) {  // 2) process each entry
                    zip.files[relativePath].async('text')
                    .then(function(data) {
                        key++;
                        // Have to add this when settled down.
                        //saveSequence(JSON.parse(data), key);
                        fillDragfrom();
                    }); 
                });
            }, function (e) {
                sweetAlert("Error reading " + f.name + ": " + e.message);
            });
        } 
        help.html="";
        let files = evt.target.files;
        for (let i = 0; i < files.length; i++) {
            handleFile(files[i]);
        }
    })
    
    // Load project from localStorage through the popup dialog
    $("body").on("click",".fa-upload",function() {
        let tr=$(this).parent().parent();
        let key=parseInt(tr.data("key"));
        let indx=existsIndex("key",key);
        let context=$(this).data("context");
        // Load either sequence or chain
        const dropnumLength=16;
        if (context=="drag") {
            let i=dropnumLength+1;
            while(i--) {
                if ($("#dropnum_"+i).hasClass("dropnum-full")) {
                    if (i==dropnumLength) {
                        sweetAlert("All 16 chain slots in use.");
                        return;
                    }
                    i++;
                    break;
                }
            }
            if (i==-1) {
                i=1;
            }
            let tgt=$("#dropto_"+i);
            tgt.append('<span data-key="'+key+'" id="'+key+'" class="chain-item" draggable="true">'+projectIndex[indx].abbr+'</span><span class="fa fa-times" title="Remove from Chain"></span><span class="fa fa-refresh" title="Loop/ Edit Sequence"></span>');
            $(".dropto").removeClass("dropto-orange");
            $(".dropnum").removeClass("dropnum-white");
            tgt.addClass("dropto-grey dropto-orange");
            tgt.prev($(".dropnum")).addClass("dropnum-white dropnum-full");
            
        } else {
            $("#ht2").trigger("click");
            if (projectIndex[indx].chain.length==0) {
            loadSequence(key,true);
            } else {
                loadChain(indx);
            }
        }
    })
    
    // Changing the project name in popup table
    $("body").on("change",".project-name",function() {
        let that=$(this);
        if (!that[0].checkValidity()) {
            sweetAlert(that.prop("title"));
            return;
        }
        
        let name=that.val().trim();
        let indx=existsIndex("name",name);
        if (indx) {
            sweetAlert("That name already taken.");
            return;            
        }
        
        let tr=that.parent().parent();
        let key=parseInt(tr.data("key"));  
        indx=existsIndex("key",key);
        projectIndex[indx].name=name;
        setLastModified(indx);
        localStorage.setItem("projectIndex",JSON.stringify(projectIndex));  
        
        fillDragfrom();
    })    
    
    // Changing the abbreviation
    $("body").on("change",".abbr",function() {
        let that=$(this);
        if (!that[0].checkValidity()) {
            sweetAlert(that.prop("title"));
            return;
        }
        let abbr=that.val().trim().toUpperCase();
        let indx=existsIndex("abbr",abbr);
        if (indx) {
            sweetAlert("That abbreviation already in use. Try again.");
            return;            
        }        
        let tr=that.parent().parent();
        let key=parseInt(tr.data("key"));  
        indx=existsIndex("key",key);
        projectIndex[indx].abbr=abbr;
        setLastModified(indx);
        
        localStorage.setItem("projectIndex",JSON.stringify(projectIndex));  
        
        fillDragfrom();
    })    
    
    // Retrieve project code from localStorage to show in dialog
    $("body").on("click",".fa-code",function() {
        let tr=$(this).parent().parent();
        let key=parseInt(tr.data("key"));
        let name=tr.find(".project-name").val();
        var blob = new Blob([localStorage.getItem(key)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name+".json");
    })    
    
    // Delete Sequence. Removes from localStorage and from any Chain.
    $("body").on("click",".fa-trash-o",function() {
        let tr=$(this).parent().parent();
        let key=parseInt(tr.data("key"));
        let name=tr.find("input").val();
        
        sweetAlert({
            title: "Sure you want to delete "+ name+"?",
            text: "You can use Export to backup all your work.",
            icon: "warning",
            buttons: true,
            dangerMode: true
        })
        .then((willDelete) => {
            if (willDelete) {
                for (i in projectIndex) {
                    if (projectIndex[i].key==key) {
                        projectIndex.splice(i,1);
                        break;
                    }
                }
                localStorage.setItem("projectIndex",JSON.stringify(projectIndex));
                localStorage.removeItem(key);
                tr.remove();
                fillDragfrom();
                $(".dropto").find("span[data-key="+key+"]").removeClass("dropto-grey dropto-orange").remove();
                if (project.sequencekey==key) {
                    clear.trigger("click");
                }
            }
        });    
    })

       // User clicks SAVE button in dialog
       $("body").on("click","#save",function() {
        // Validation first
        let name=$("#project-name").val().trim();
        if (name.length==0) {
            sweetAlert("Must enter a name.");
            return;            
        }
        if (!$("#project-name")[0].checkValidity()) {
            sweetAlert("Invalid  name.");
            return;
        }
        // Set entry in projectIndex
        let now=new Date();
        let chain=[];
        let sequence="";
        let key="";
        let slot="";
        $(".chain-item").each(function() {
            key=$(this).data("key");
            slot=$(this).parent().prop("id");
            chain.push({"key":key,"slot":slot});
        });
        if (chain.length==0) {
            sequence=JSON.stringify(project);
        }

        db.transaction("projects","readwrite").objectStore("projects")
          .add({name:name,
                abbr:createAbbr(name), 
                last_modified_unix:now.getTime(),
                last_modified:now.getDate()+"/"+now.getMonth()+"/"+now.getFullYear()+" "+now.getHours().toString().paddingLeft("00")+":"+now.getMinutes().toString().paddingLeft("00"),
                chain:chain,
                sequence:sequence}).onsuccess=function(e) {
            console.log("Inserted successfully - "+name);
        };
        
        fillDragfrom();
        $("body").find("#popup-table tbody").replaceWith(listProject("last_modified_unix","desc"));      
    })
    
    // List Chains and Sequences. Prompt for Chain/Sequence new name on Save.
    function listProject(triggerby, sortdir) {
        let html="";
        let nb=0;
        
        function printtr(id, name, abbr, last_modified, chain) {
            nb++;
            html+='<tr data-key="'+id+'">';
            html+='<td class="centre"><span class="fa fa-upload"></span></td>';
            html+='<td>';
            html+='<input class="project-name" type="text" maxlength="50" value="'+name+'" title="Mandatory name (max. 50 characters)" required>';
            if (chain.length>0) {
                html+='<span class="fa fa-angle-right" title="Show/Hide component sequences"></span>';
            }
            html+='</td>';
            html+='<td><input class="abbr" type="text" maxlength="3" size="3" value="'+abbr+'" pattern="[A-Za-z0-9]{2}" title="Mandatory 2 character abbreviation" required></td>';
            html+="<td>"+last_modified+"</td>";
            html+='<td class="centre"><span class="fa fa-code"></span></td>';
            html+='<td class="centre"><span class="fa fa-trash-o"></span></td>';
            html+="</tr>";              
        }
        
        function makeBody() {
            html+='<tbody>';
            let chainSeq=[];
            let found=false;
            let key="";
            console.log(db);
            db.transaction("projects","readonly").objectStore("projects").openCursor().onsuccess = function(e) {
                console.log(e);
                let cursor=e.target.result;
                if(cursor) {
                    printtr(cursor.value.id, cursor.value.name, cursor.value.abbr, cursor.value.last_modified, cursor.value.chain);
                    cursor.continue();
                } 
            }

            html+='</tbody>';            
        }
        // TOBE COMPLETED
        /*
        if (triggerby!="btn-save" && triggerby!="btn-load") {
            projectIndex.sort(compareValues(triggerby, sortdir));
            makeBody();
            return html;
        }*/
        
        html='<div id="popup-container">';     
        if (triggerby=="btn-save") {
            html+='<div>';
            html+='<input id="project-name" type="text" maxlength="50" title="Mandatory name (max. 50 characters)" required ';
            let chainsLength=$(".chain-item").length;
            if (currentChain.key) {
                html+='value="'+currentChain.name+'">';
            } else if (chainsLength==0 && project.sequencekey) {
                let indx=existsIndex("key",project.sequencekey);
                html+='value="'+projectIndex[indx].name+'">';
            } else {
                html+='placeholder="Enter name">';
            } //bug
            html+='<button type="button" id="save">Save</button>';
            html+='<button type="button" id="exportall">Export All</button>';
            html+='</div>';
        }
        
        html+='<table id="popup-table">';
        html+='<thead><tr>';
        html+='<th>Load</th>';
        html+='<th>Name<span class="fa fa-sort-asc" data-sortby="name"></span></th>';
        html+='<th>Abbr<span class="fa fa-sort-asc" data-sortby="abbr"></span></th>';
        html+='<th>Last Modified<span class="fa fa-sort-asc" data-sortby="key"></span></th>';
        html+='<th>Code</th>';
        html+='<th>Delete</th>';
        html+='</tr></thead>';
     
        makeBody();
        
        if (triggerby=="btn-save" || triggerby!=="btn-load") {
            html+='</table></div>';
        }

        if (triggerby=="btn-load" && nb==0) {
            return false;
        }        
        return html;
    }  
    
    // User clicks "SAVE" or "LOAD" button
    $("#btn-save, #btn-load").on("click",function(){
        // Create pop-up dialog for SAVE, LOAD etc
        let popup=$('#popup-dialog').dialog({
            autoOpen: false,
            modal: true,
            width: 620,
            height: 350,
            open: function (event, ui) {
            },
            close: function (event, ui) { 
            }
        });        
        let id=this.id;
        let nbCells=$(".cell.selected").length;
        if (nbCells==0 && id=="btn-save") {
            sweetAlert("Your sequence has no sounds.");
            return;
        }
        console.log("callling listProject");
        let html=listProject(id);
        if (!html) {
            sweetAlert("No projects saved.");
            return;
        }
        console.log(html);
        popup.html(html);     
        popup.dialog('open');
    });     
    
    // User clicks single(S) button for a channel. S and M buttons are mutually exclusive
    $("body").on("click",".btn-single",function () {
        let that=$(this);
        let y=that.closest("tr").data("y");
        that.toggleClass("single");
          if (that.hasClass("single")) {
            project.sounds[y].single=true;
        } else {
            project.sounds[y].single=false;
        }
        that.nextAll(".btn-mute").prop("disabled",project.sounds[y].single);
    });
    
    // User clicks mute button for a channel
    
    $("body").on("click",".btn-mute",function () {
        let that=$(this);
        let y=that.closest("tr").data("y");
        that.toggleClass("muted");
        if (that.hasClass("muted")) {
            project.sounds[y].mute=true;
        } else {
            project.sounds[y].mute=false;
        }
        that.prevAll(".btn-single").prop("disabled",project.sounds[y].mute);
    });
    
    // Click&drag function
    var down = false;
        
    $(document).mouseup(function() {
        down = false;
    });
        
    function selectCell(that) {
        let x=that.data("x");
        let y=that.closest("tr").data("y");
        
        that.toggleClass("selected");
        
        if (that.hasClass("selected")) {
            project.sounds[y].sequence[x]=0.5;
        } else {
            project.sounds[y].sequence[x]=0.0;
        }
    }
    
    $("body").on("mouseover",".cell",function(){
        if(down) {
            selectCell($(this));
        }
    });

    $("body").on("mousedown",".cell",function(){
        down = true;
        selectCell($(this));
    });


    // Start or pause playing the sequence or chain
    play.click(function () {
        if (icon.hasClass("fa-pause")) {
            clearInterval(interval);
        } else {
            chains=[];
            chains_pos=0;
            $(".chain-item").each(function(index,value) {
                let key=$(this).data("key");
                let slot=$(this).parent().prop("id");
                let loop='';
                if ($(this).parent().hasClass("yellow")) {
                    loop="yellow";
                }
                chains.push({"key":key,"slot":slot,"loop":loop});
                if ($(this).parent().hasClass("dropto-orange")) {
                    chains_pos=index;
                }
            });
            if (chains.length>0) {
                if (chains[chains_pos].loop) {
                    loadSequence(chains[chains_pos].key,true);
                } else {
                    loadSequence(chains[chains_pos].key,false);
                }
            }
            interval=setInterval(playSequence, 60000/(project.bpm * 4));
        }
        icon.toggleClass('fa-play fa-pause');
    });
    
    // User clicks the meter to restart the sequence.
    $("#meter td").click(function () {
        let that=$(this);
        let x=parseInt(that.data("x"));

        if (x>=0) {
            $(".current").removeClass("current");
            pos=x;
            that.addClass("current");
        }
    });
    
    // Set BPM up or down using PLUS and MINUS buttons
    $(".bpm-num").click(function () {
        let increment=parseInt($(this).data("increment"));
        let bpm2=project.bpm+increment;
        if (bpm2<10 || bpm2>300) {
            sweetAlert("BPM must be between 10 and 300.")
            return;
        }
        project.bpm=bpm2;
        bpm.text(project.bpm);
        if (icon.hasClass("fa-pause")) {
            clearInterval(interval);
            interval=setInterval(playSequence,60000/(project.bpm * 4));
        }
        });

    // Clear button - reset all selected cells 
    clear.click(function () {
        if (interval) {
            clearInterval(interval);
            icon.removeClass("fa-pause").addClass("fa-play");
        }
        $("button").prop("disabled",false).removeClass("single").removeClass("muted").removeClass("selected");
        resetCurrent();
        $("#bpm").text("120");
        project.bpm=120; 
        currentSequence.key=0;
        currentSequence.name="";
        project.chain.length=0;
        for (i in project.sounds) {
            $("tbody #volume"+i).val("0.5");
            $("tbody #stereo"+i).val("0");
            project.sounds[i].single=false;
            project.sounds[i].mute=false;
            project.sounds[i].volume=0.5;
            for (let j=0; j<sequenceLength; j++) {
                project.sounds[i].sequence[j]=0;
            }
        }
    });  
      
});