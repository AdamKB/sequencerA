$(function() {
    
    "use strict";
    
    var currentChain={"key":0,"name":""};
    var currentSequence={"key":0,"name":""};

    //Show component sequences in Save/Load dialog
    $("body").on("click",".fa-angle-right",function() {
        let tr=$(this).closest("tr");
        let key=tr.data("key");
        let that=$(this);

        that.toggleClass("fa-angle-right fa-angle-down");

        if (that.hasClass("fa-caret-down")) {
            that.addClass("downArrow");
        }

        for (i in projectIndex) {
            if (projectIndex[i].key==key) {
                let chainArray=projectIndex[i].chain;
                for (j in chainArray) {
                    let seqKey=chainArray[j].key;
                    for (i in projectIndex) {
                        if (projectIndex[i].key==seqKey) {
                            let compseq=projectIndex[i];
                            let newRow='<tr data-key='+compseq.key+' class="'+key+'"><td><span class="fa fa-upload"></span></td><td>'+compseq.name+'</td><td>'+compseq.abbr+'</td><td>'+compseq.last_modified+'</td><td><span class="fa fa-code"></span></td></tr>';
                            tr.after(newRow);
                        }
                    }
                }
            }
        }
    });
    
    $("body").on("click",".fa-angle-down",function() {
        let that=$(this);
        let tr=$(this).closest("tr");
        let key=tr.data("key");        

        $("#popup-table tr." + key).remove();
        
        that.toggleClass("fa-angle-down fa-angle-right");
    });
    
    //Show component sequences in Chain button
    $("body").on("click",".fa-caret-down",function() {
            let key=$(this).parent().attr("id");
            let html='';
            let compseq=projectIndex[i];

            html+='<table id="popup-table">';
            html+='<thead><tr>';
            html+='<th>Load</th>';
            html+='<th>Name</th>';
            html+='<th>Abbr</th>';
            html+='<th>Last Modified</th>';
            html+='<th><i class="fa fa-cube"></i></th>';
            html+='</tr></thead>';
            
            for (i in projectIndex) {
                if (projectIndex[i].key==key) {
                    let chainArray=projectIndex[i].chain;
                    for (j in chainArray) {
                        let seqKey=chainArray[j].key;
                        for (i in projectIndex) {
                            let slot=chainArray[j].slot;
                            let slotnumber=slot.slice(-2);
                            slotnumber=slotnumber.replace(/_/i,"");
                            if (projectIndex[i].key==seqKey) {
                                let compseq=projectIndex[i];
                                html+='<tr data-key='+compseq.key+'><td><span class="fa fa-upload" data-context="drag"></span></td><td>'+compseq.name+'</td><td>'+compseq.abbr+'</td><td>'+compseq.last_modified+'</td><td>'+slotnumber+'</td></tr>';
                            }
                        }
                    }
                }
            }
            html+='</table>';
            //html+='</div>';  
        
        popup.html(html);
        popup.dialog('open');
    });
    
    // Generic help function
    var help = $("#help-text");
    help.addClass("help-box");

    $("#ht").addClass("ht-hide");
    
    function showHelp() {
        $("[data-help]").hover(
            function() {
            let title=$(this).data("help");
            help.text('').append(title);
         }, function() {
            help.text('');
         });
    };
    
    function hideHelp() {
        $("[data-help]").hover(function() {
            help.text('').append('');
         });
    };
    
    $("#ht").click(function() {
        $(this).toggleClass("ht-show");
        if ($(this).hasClass("ht-show")) {
            hideHelp();
        } else {
            showHelp();
        }
    });
    
    showHelp();
    
    
    // Import zip file button
    $("#btn-import").on("click", function(){
        $("#importfile").trigger("click");
    });
    
    // Clear chain button 
    $("#ht2").on("click", function clearChain() {
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
        if (projectIndex[indx].chain.length==0) {
            tgt.empty();
            tgt.append('<span data-key="'+key+'" id="'+key+'" class="chain-item" draggable="true">'+projectIndex[indx].abbr+'</span><span class="fa fa-times" title="Remove from Chain"></span><span class="fa fa-refresh" title="Loop/ Edit Sequence"></span>');
            loadSequence(key,false);
            event.preventDefault();
            $(".dropto").removeClass("dropto-orange");
            $(".dropnum").removeClass("dropnum-white");
            tgt.addClass("dropto-grey dropto-orange");
            tgt.prev($(".dropnum")).addClass("dropnum-white dropnum-full");
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
            hSounds[i]=new Howl({format: project.sounds[i].format, volume: project.sounds[i].volume, src: url+"/"+project.sounds[i].id, stereo: project.sounds[i].stereo});
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
    
    var solo = $(".btn-single");
    var mute = $(".btn-mute");
    var save = $("#btn-save");
    var load = $("#btn-load");
    var clear = $("#btn-clear");
    var play = $("#start-stop"),
        icon = play.find("span");
    var bpm = $("#bpm");
    var cell = $(".cell");
    var reset = $("#reset");
    //var volume = $(".btn-volume");
    //var pan = $(".btn-pan");
    var dragBtn = $(".dragAbbr-btn");
    var ht2 = $("#meter td:last-child");
    var dropto = $(".dropto");
    
    $(".btn-volume, .btn-pan").change(function() {
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
    
    function setLastModified(indx) {
        let now=new Date();
        projectIndex[indx].last_modified_unix=Math.round(now.getTime() / 1000);
        projectIndex[indx].last_modified=now.getDate()+"/"+now.getMonth()+"/"+now.getFullYear()+" "+now.getHours().toString().paddingLeft("00")+":"+now.getMinutes().toString().paddingLeft("00");
    }

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
        // Check name not already used
        let indx=existsIndex("name",name);
        if (currentChain.name && indx) {
            sweetAlert("Name already in use.");
            return;
        }
        // Set entry in projectIndex
        let now=new Date();
        if (!indx) {
            let index={};
            index.name=name;
            index.abbr=createAbbr(name);
            index.key=Math.round(now.getTime() / 1000);
            projectIndex.unshift(index); 
            indx=0;
        }
        
        setLastModified(indx);
        
        projectIndex[indx].chain=[];
        let key="";
        let slot="";
        $(".chain-item").each(function() {
            key=$(this).data("key");
            slot=$(this).parent().prop("id");
            projectIndex[indx].chain.push({"key":key,"slot":slot});
        });        
        
        // Set projectIndex in localStorage
        localStorage.setItem("projectIndex",JSON.stringify(projectIndex));

        // If sequence data, set localStorage for project object
        if (projectIndex[indx].chain.length==0) {
            project.bpm=parseInt($("#bpm").text());
            project.sequencekey=projectIndex[indx].key;
            let str=JSON.stringify(project);
            projectIndex[indx].hash=str.hashCode();
            localStorage.setItem(projectIndex[indx].key,str);  
        }
        
        fillDragfrom();
        $("body").find("#popup-table tbody").replaceWith(listProject("last_modified_unix","desc"));      
    })
    
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
                        sweetAlert("noRoom");
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
    
    // List Chains and Sequences. Prompt for Chain/Sequence new name on Save.
    function listProject(triggerby, sortdir) {
        let html="";
        let nb=0;
        
        function printtr(isChain) {
            nb++;
            html+='<tr data-key="'+projectIndex[i].key+'">';
            html+='<td class="centre"><span class="fa fa-upload"></span></td>';
            html+='<td>';
            html+='<input class="project-name" type="text" maxlength="50" value="'+projectIndex[i].name+'" title="Mandatory name (max. 50 characters)" required>';
            if (isChain) {
                html+='<span class="fa fa-angle-right" title="Show/Hide component sequences"></span>';
            }
            html+='</td>';
            html+='<td><input class="abbr" type="text" maxlength="3" size="3" value="'+projectIndex[i].abbr+'" pattern="[A-Za-z0-9]{2}" title="Mandatory 2 character abbreviation" required></td>';
            html+="<td>"+projectIndex[i].last_modified+"</td>";
            html+='<td class="centre"><span class="fa fa-code"></span></td>';
            html+='<td class="centre"><span class="fa fa-trash-o"></span></td>';
            html+="</tr>";              
        }
        
        function makeBody() {
            html+='<tbody>';
            let chainSeq=[];
            let found=false;
            let key="";
            // Print Chains first
            for (i in projectIndex) {
                if (projectIndex[i].chain.length>0) {
                    for (j in projectIndex[i].chain) {
                        chainSeq.push(projectIndex[i].chain[j].key);
                    }
                    printtr(true);                  
                }
            }
            // Print orphan sequences
            for (i in projectIndex) {
                if (projectIndex[i].chain.length==0) {
                    key = projectIndex[i].key;
                    found=false;
                    for (j in chainSeq) {
                        if (key==chainSeq[j]) {
                            found=true;
                            break;
                        }
                    }
                    if (!found) {
                        printtr(false);
                    }
                }
            }            
            html+='</tbody>';            
        }
        
        if (triggerby!="btn-save" && triggerby!="btn-load") {
            projectIndex.sort(compareValues(triggerby, sortdir));
            makeBody();
            return html;
        }
        
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
        let id=this.id;
        let nbCells=$(".cell.selected").length;
        if (nbCells==0 && id=="btn-save") {
            sweetAlert("Your sequence has no sounds.");
            return;
        }
        let html=listProject(id);
        if (!html) {
            sweetAlert("No projects saved.");
            return;
        }
        popup.html(html);     
        popup.dialog('open');
    });     
    
    // User clicks single(S) button for a channel. S and M buttons are mutually exclusive
    solo.click(function () {
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
    mute.click(function () {
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
    
    $(".cell").mouseover(function(){
        if(down) {
            selectCell($(this));
        }
    });

    $(".cell").mousedown(function () {
        down = true;
        selectCell($(this));
    });


    // Start or pause playing the sequence or chain
    play.click(function () {
        if (icon.hasClass("fa-pause")) {
            clearInterval(interval);
        } else {
            let chains=[];
            let chains_pos=0;
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
            interval=setInterval(function() {playSequence(chains, chains_pos)}, 60000/(project.bpm * 4));
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
            $("#volume"+i).val("0.5");
            $("#stereo"+i).val("0");
            project.sounds[i].single=false;
            project.sounds[i].mute=false;
            project.sounds[i].volume=0.5;
            for (let j=0; j<sequenceLength; j++) {
                project.sounds[i].sequence[j]=0;
            }
        }
    });  
    
    // Remove local Storage - reset application as if first use 
    $("#clearAll").on("click",function() {
        sweetAlert({
            title: "Sure you want to reset all localStorage items?",
            text: "This resets storage to status as if visiting application for first time.",
            icon: "warning",
            buttons: true,
            dangerMode: true
        })
        .then((willClear) => {
            if (willClear) {
                localStorage.clear();
                window.location.reload();
            }
        });            
    });    
    // Dump local Storage - test only
    $("#dump").on("click",function() {
        let html=`<table id="popup-table">
                <thead>
                    <tr>
                       <th>key</th><th>name</th><th>abbr</th><th>chain</th><th>last_modified</th><th>last_modified_unix</th>
                    </tr>
                </thead>`;  
        let chain="";
        for (i in projectIndex) {
            chain="";
            for (j in projectIndex[i].chain) {
                chain+=projectIndex[i].chain[j].key+",";    
            }
            html+=`<tr><td>${projectIndex[i].key}</td><td>${projectIndex[i].name}</td><td>${projectIndex[i].abbr}</td><td>${chain}</td><td>${projectIndex[i].last_modified}</td><td>${projectIndex[i].last_modified_unix}</td><tr>`;
        }
        html+="</table>";
        popup.html(html);
        popup.dialog('open');
    });        
});
