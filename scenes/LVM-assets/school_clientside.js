print("LOAD School Clientside");


engine.IncludeFile("local://class.js");
engine.IncludeFile("local://vector.js");
engine.IncludeFile("local://fishgame_planktonsystem.js");
engine.IncludeFile("local://fishgame_schoolconst.js");
var isserver = server.IsRunning();

var school = scene.GetEntityByNameRaw(me.name.split('-')[0]); //not there immediately, must wait that entity creation is finished
var systems = [];
      
function createSystems(count) {
    var schoolPos = school.placeable.transform.pos;
    var systemPos = new Vector3df();
    for(var i = 0; i < count; i++) {
        systemPos.x = schoolPos.x + (Math.random()-0.5)*schoolSize.x;
        systemPos.y = schoolPos.y + (Math.random()-0.5)*schoolSize.y;
        systemPos.z = schoolPos.z + (Math.random()-0.5)*schoolSize.z;

        var system = new System(me.name+'-System_'+i, systemPos);
        systems.push(system);
   }
}
   
function updateSystems(dt) {
    for(var i = 0; i < systems.length; ++i) {
        var system = systems[i];
        try {
            system.entity_.placeable; //was removed by the player who ate it
        } catch (e) {
            systems.splice(i, 1);
            break;
        }
        //if(system.alive_) {
            system.update(dt, school.placeable.transform.pos, systems);
        /*}
        //else {
            print(i+' dead');
        }*/
    }
}

if (!isserver) {
    print("RUN School Clientside");

    createSystems(1); //5
    frame.Updated.connect(updateSystems);
}