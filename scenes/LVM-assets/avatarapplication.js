// Avatar application. Will handle switching logic between avatar & freelook camera (clientside), and
// spawning avatars for clients (serverside). Note: this is not a startup script, but is meant to be
// placed in an entity in a scene that wishes to implement avatar functionality.

var avatar_area_size = 10;
var avatar_area_x = -65.0;
var avatar_area_y = 26.35;
var avatar_area_z = 10;

var isserver = server.IsRunning();

if (isserver == false)
{
    var inputmapper = me.GetOrCreateComponentRaw("EC_InputMapper");
    inputmapper.SetTemporary(true);
    inputmapper.contextPriority = 102;
    inputmapper.RegisterMapping("Ctrl+Tab", "ToggleCamera", 1);

    me.Action("ToggleCamera").Triggered.connect(ClientHandleToggleCamera);
}
else
{
    server.UserAboutToConnect.connect(ServerHandleUserAboutToConnect);
    server.UserConnected.connect(ServerHandleUserConnected);
    server.UserDisconnected.connect(ServerHandleUserDisconnected);
}

function ClientHandleToggleCamera()
{
    // For camera switching to work, must have both the freelookcamera & avatarcamera in the scene
    var freelookcameraentity = scene.GetEntityByNameRaw("FreeLookCamera");
    var avatarcameraentity = scene.GetEntityByNameRaw("AvatarCamera");
    if ((freelookcameraentity == null) || (avatarcameraentity == null))
        return;
    var freelookcamera = freelookcameraentity.ogrecamera;
    var avatarcamera = avatarcameraentity.ogrecamera;

    if (avatarcamera.IsActive())
    {
        freelookcameraentity.placeable.transform = avatarcameraentity.placeable.transform;
        freelookcamera.SetActive();
    }
    else
    {
        avatarcamera.SetActive();
    }
}

function ServerHandleUserAboutToConnect(connectionID, user)
{
    // Uncomment to test access control
    //if (user.GetProperty("password") != "xxx")
    //    user.DenyConnection();
}

function ServerHandleUserConnected(connectionID, user)
{
    var avatarEntityName = "Avatar" + connectionID;
    var avatarEntity = scene.CreateEntityRaw(scene.NextFreeId(), ["EC_Script", "EC_Placeable", "EC_AnimationController"]);
    avatarEntity.SetTemporary(true); // We never want to save the avatar entities to disk.
    avatarEntity.SetName(avatarEntityName);
    avatarEntity.SetDescription(user.GetProperty("username"));

    print("Hai. Ur name is " + user.GetProperty("username"));

    var script = avatarEntity.script;
    script.type = "js";
    script.runOnLoad = true;
    var r = script.scriptRef;
    r.ref = "local://simpleavatar.js";
    script.scriptRef = r;

    var placeable = avatarEntity.placeable;
    // Set random starting position for avatar
    var transform = placeable.transform;
    transform.pos.x = (Math.random() - 0.5) * avatar_area_size + avatar_area_x;
    transform.pos.y = (Math.random() - 0.5) * avatar_area_size + avatar_area_y;
    transform.pos.z = avatar_area_z;
    placeable.transform = transform;

    scene.EmitEntityCreatedRaw(avatarEntity);
}

function ServerHandleUserDisconnected(connectionID, user)
{
    var avatarEntityName = "Avatar" + connectionID;
    var entityID = scene.GetEntityByNameRaw(avatarEntityName).id;
    scene.RemoveEntityRaw(entityID);

    print("Kthxbye, " + user.GetProperty("username"));
}
