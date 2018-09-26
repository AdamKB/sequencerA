    //jQuery.event.props.push('dataTransfer');
    
    // projectIndex catalogs all sequences and chains held in local Storage
    //var projectIndex = JSON.parse(localStorage.getItem("projectIndex"));  
    //if (!projectIndex) {
    //    projectIndex=[];
    //}
    

    // Create new "hSounds" array for the project
    //var hSounds=[];
    //for (i in project.sounds) {
    //    hSounds[i]=new Howl({format: project.sounds[i].format, volume: project.sounds[i].volume, src: url+"/"+project.sounds[i].id, stereo: project.sounds[i].stereo});
    //}  



    // function for dynamic sorting
    function compareValues(key, order) {
      return function(a, b) {
        if(!a.hasOwnProperty(key) || 
           !b.hasOwnProperty(key)) {
           console.log("no property:"+key+":")
          return 0; 
        }

        const varA = (typeof a[key] === 'string') ? 
          a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ? 
          b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return (
          (order == 'desc') ? 
          (comparison * -1) : comparison
        );
      };
    }
    
    // Create abbreviated name
    function createAbbr(name) {
        let name2=name.replace(/[^0-9A-Z]+/gi," ");  // Remove non alphanumeric characters
        name2=name2.replace(/\s+/g, ' ');            // Reduce multiple spaces to one space for word split

        let words=name2.split(" ",2);                // Get first 2 words 
        let abbr="";
        if (words.length>1) {                        // If name comprised of more than 1 space separated word 
            abbr=words[0].substring(0,1)+            //   then create initial abbreviation from first letter of each word
                 words[1].substring(0,1);
        } else {
            abbr=name2.substring(0,2);               // Else initial abbreviation is first 2 letters of name
        }
        abbr=abbr.toUpperCase();                    

        // Check if abbreviaion already used, in which case change it until unique by adding suffixes in order from 1..9 and A..Z
        let sfx="123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let sfxi=-1;
        let uniq=false;
        let xAbbr="";
        while (!uniq) {
            xAbbr=existsIndex("abbr",abbr);
            if (!xAbbr) {
                uniq=true;
                break;
            }
            sfxi++;
            if (sfxi>sfx.length) {
                sweetAlert("Exhausted all "+sfx.length+" suffixes. Cannot Save.");
                return;
            }
            abbr=abbr.substring(0,2)+sfx[sfxi];
        }
        return(abbr);
    }

    //Check if value  exists for property in projectIndex returning object if exists.
    function existsIndex(property, value) {
        
        let exists=false;
        let compareValue="";
        if (typeof value === 'string' || value instanceof String) {
            compareValue=value.toUpperCase();
        } else {
            compareValue=value;
        }
        /*
        for (i in projectIndex) {
            switch (property) {
                case "name": if (projectIndex[i].name.toUpperCase()==compareValue) {exists=true;}; break;
                case "abbr": if (projectIndex[i].abbr.toUpperCase()==compareValue) {exists=true;}; break;
                case "key":  if (projectIndex[i].key==value)  {exists=true;}; break;
                default: sweetAlert("ERROR. property "+property+" not handled in function existsIndex.");
            }
            
            if (exists) {
                return i;
            }
        }
        */
        return null;
    }   

    
    // Fill top-right section with locally stored Chains and Sequences.
    function fillDragfrom() {    
        let drag='<div id="dragfrom">';
        let nb=0;
        let chainedSeq=[];
        let name="";
        let key="";
        let abbr="";
        let lastModified="";
        /*
        for (i in projectIndex) {
            if (projectIndex[i].chain.length>0) {
                for (j in projectIndex[i].chain) {
                    chainedSeq.push(projectIndex[i].chain[j].key);
                }
                nb++;
                name = projectIndex[i].name;
                abbr = projectIndex[i].abbr;
                key = projectIndex[i].key;
                lastModified = projectIndex[i].last_modified;                
                drag+='<div class="chain-btn" draggable="true" id="'+key+'">'+
                        '<span class="chain-abbr" title="'+name+'&nbsp;'+lastModified+'">'+abbr+'</span>'+
                        '<span class="fa fa-caret-down"></span>'+
                      '</div>';
            }
        } 
        for (i in projectIndex) {
            if (projectIndex[i].chain.length==0) {
                key = projectIndex[i].key;
                
                let found=false;
                for (j=0; j<chainedSeq.length; j++) {
                    if (key==chainedSeq[j]) {
                        found=true;
                        break;
                    }
                }
                if (!found) {
                    nb++;
                    name = projectIndex[i].name;
                    abbr = projectIndex[i].abbr;
                    lastModified = projectIndex[i].last_modified;
                    drag+='<span draggable="true" id="'+key+'" class="dragAbbr-btn" title="'+name+'&nbsp;'+lastModified+'">'+abbr+'</span>';
                }
            }
        } 
        */
        if (nb==0) {
            drag+="<p>No Sequences Saved</p>";
        } else {
            drag+='<p data-help="Represents saved sequences and chain. Drag and drop into numbered blocks below to create chain of sequences."></p>';
        }
        drag+="</div>";
        $("#dragfrom").replaceWith(drag);
    };
    

    // Play each note in the sequence array. Notes with no volume or muted are not played.
    function playSequence() {
        let single=false;
        for (j in project.sounds) {
            if (project.sounds[j].single) {
                single=true;
                break;
            }
        }
        for (i in project.sounds) {
            if (project.sounds[i].sequence[pos] && !project.sounds[i].mute) {
                if (!single || (single && project.sounds[i].single)) {
                    hSounds[i].play();
                }
            }
        }

        // Move the meter to next position after all sounds played
        $(".current").removeClass("current");
        
        pos=(pos+1)%sequenceLength;
        $("#meter th[data-x="+pos+"]").addClass("current");

        // End of sequence. IF playing chain then load/play next sequence in chain else loop on currently displayed sequence
        if (pos==0) {
            let chainsLength=chains.length;
            if (chainsLength>0) {
                function setmarker() {
                    let dropto=chains[chains_pos].slot;
                    let dropnum=dropto.replace("dropto","dropnum");                    
                    $("#"+dropto).toggleClass("dropto-orange"); 
                    $("#"+dropnum).toggleClass("dropnum-white");  
                }

                setmarker();
                chains_pos=(chains_pos+1)%chainsLength; 
                project=JSON.parse(localStorage.getItem(chains[chains_pos].key));
                setmarker();
                
                //bpm.text(project.bpm);
                for (i in project.sounds) {
                    $("#sound"+i).text(project.sounds[i].name);
                    $("#volume"+i).val(project.sounds[i].volume);
                    $("#stereo"+i).val(project.sounds[i].stereo);
                    hSounds[i]=new Howl({format: project.sounds[i].format, volume: project.sounds[i].volume, src: url+"/"+project.sounds[i].id, stereo: project.sounds[i].stereo});
                    for (let j=0; j<sequenceLength; j++) {
                        if (project.sounds[i].sequence[j]) {
                            $("tr[data-y="+i+"]").find("[data-x="+j+"]").addClass("selected");
                        } else {
                            $("tr[data-y="+i+"]").find("[data-x="+j+"]").removeClass("selected");
                        }
                    }
                }
            }
        }
    }

    function playSound(id, format) {
        let sample=new Howl({format: format, volume: 0.5, src: url+"/"+id});
        sample.play();
    }    
    
    /*
    $.contextMenu({
        selector: '.btn-sound', 
        trigger: "left",
        callback: function(key, opt) {
            // Get the triggering element id
            let triggerid=$("#"+opt.$trigger[0].id);
            
            if (key=="replace") {
                let sampled=triggerid.data("sampled");  //e.g. 205-wav-bongo2 or undefined if no sound previously sampled
                if (!sampled) {
                    sweetAlert("Play a sample sound first to replace "+opt.$trigger[0].innerText);
                    return false;
                }
                //if (confirm("Replace: "+opt.$trigger[0].innerText + " with " + sampled.name)) {
                triggerid.text(sampled.name);
                let y=triggerid.closest("tr").data("y");
                hSounds[y]=new Howl({format: sampled.format, volume: 0.5, src: url+"/"+sampled.id});
                project.sounds[y].name=sampled.name;
                project.sounds[y].format=sampled.format;
                project.sounds[y].id=sampled.id;
                triggerid.removeData("sampled"); 
                return true;
            }
            
            let i1=key.indexOf("-");
            let i2=key.lastIndexOf("-");
            let id=key.substring(0,i1);
            let format=key.substring(i1+1,i2);
            let name=key.substring(i2+1);
            
            playSound(id, format);
            triggerid.data("sampled",{"id":id, "format":format, "name": name}); // e.g. set data to 205-wav-bongo2
            
            return false; // means keep submenu open
        },
        items: sounds
    });
    */
        
    String.prototype.paddingLeft = function (paddingValue) {
        return String(paddingValue + this).slice(-paddingValue.length);
    };
    
    String.prototype.hashCode = function() {
        let hash=0;
        let char="";
        if (this.length == 0) return hash;
        for (i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
    
