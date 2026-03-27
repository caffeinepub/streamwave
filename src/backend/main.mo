import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserMetadata = {
    username : Text;
    avatarUrl : ?Text;
  };

  module UserMetadata {
    public func compare(user1 : UserMetadata, user2 : UserMetadata) : Order.Order {
      Text.compare(user1.username, user2.username);
    };
  };

  let users = Map.empty<Principal, UserMetadata>();

  public type VideoEntry = {
    title : Text;
    url : Text;
    size : Nat;
  };

  module VideoEntry {
    public func compare(video1 : VideoEntry, video2 : VideoEntry) : Order.Order {
      switch (Nat.compare(video1.size, video2.size)) {
        case (#equal) { Text.compare(video1.title, video2.title) };
        case (order) { order };
      };
    };

    public func compareBySize(video1 : VideoEntry, video2 : VideoEntry) : Order.Order {
      Nat.compare(video1.size, video2.size);
    };
  };

  type RoomId = Nat;

  type SignalingData = {
    sdpOffer : ?Text;
    sdpAnswer : ?Text;
    iceCandidates : List.List<Text>;
  };

  let rooms = Map.empty<RoomId, SignalingData>();

  type MessageId = Nat;
  var nextMessageId : MessageId = 0;

  type Message = {
    id : MessageId;
    roomId : RoomId;
    senderName : Text;
    text : Text;
  };

  module Message {
    public func compare(filename1 : Message, filename2 : Message) : Order.Order {
      Nat.compare(filename1.id, filename2.id);
    };
  };

  public type NewMessage = {
    senderName : Text;
    text : Text;
  };

  let messages = List.empty<Message>();

  let userVideos = Map.empty<Principal, List.List<VideoEntry>>();

  public type UpdateProfile = {
    username : Text;
    avatarUrl : Text;
  };

  public shared ({ caller }) func initializeUser(username : Text, avatarUrl : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize profiles");
    };
    if (users.containsKey(caller)) { Runtime.trap("Profile already initialized") };
    let profile = {
      username;
      avatarUrl;
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getCallerProfile() : async ?UserMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerProfile(profile : UpdateProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (users.get(caller) == null) { Runtime.trap("No profile found") };
    users.add(
      caller,
      {
        username = profile.username;
        avatarUrl = ?profile.avatarUrl;
      },
    );
  };

  public query ({ caller }) func getUserProfile(user: Principal) : async ?UserMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public query ({ caller }) func searchUsersByUsername(username : Text) : async [UserMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search users");
    };
    users.values().toArray().filter(
      func(user) {
        user.username.contains(#text username);
      }
    );
  };

  public shared ({ caller }) func createRoom() : async RoomId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create rooms");
    };
    let newRoomId = rooms.size() + 1;
    let initialSignalingData : SignalingData = {
      sdpOffer = null;
      sdpAnswer = null;
      iceCandidates = List.empty();
    };
    rooms.add(newRoomId, initialSignalingData);
    newRoomId;
  };

  public shared ({ caller }) func postSdpOffer(roomId : RoomId, sdpOffer : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post SDP offers");
    };
    switch (rooms.get(roomId)) {
      case (null) {
        let newSignalingData : SignalingData = {
          sdpOffer = ?sdpOffer;
          sdpAnswer = null;
          iceCandidates = List.empty();
        };
        rooms.add(roomId, newSignalingData);
      };
      case (?signalingData) {
        let updatedSignalingData : SignalingData = {
          sdpOffer = ?sdpOffer;
          sdpAnswer = signalingData.sdpAnswer;
          iceCandidates = signalingData.iceCandidates;
        };
        rooms.add(roomId, updatedSignalingData);
      };
    };
  };

  public query ({ caller }) func getSdpOffer(roomId : RoomId) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get SDP offers");
    };
    switch (rooms.get(roomId)) {
      case (?data) { data.sdpOffer };
      case (null) { null };
    };
  };

  public shared ({ caller }) func postSdpAnswer(roomId : RoomId, sdpAnswer : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post SDP answers");
    };
    switch (rooms.get(roomId)) {
      case (null) {
        let newSignalingData : SignalingData = {
          sdpOffer = null;
          sdpAnswer = ?sdpAnswer;
          iceCandidates = List.empty();
        };
        rooms.add(roomId, newSignalingData);
      };
      case (?signalingData) {
        let updatedSignalingData : SignalingData = {
          sdpOffer = signalingData.sdpOffer;
          sdpAnswer = ?sdpAnswer;
          iceCandidates = signalingData.iceCandidates;
        };
        rooms.add(roomId, updatedSignalingData);
      };
    };
  };

  public query ({ caller }) func getSdpAnswer(roomId : RoomId) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get SDP answers");
    };
    switch (rooms.get(roomId)) {
      case (?data) { data.sdpAnswer };
      case (null) { null };
    };
  };

  public shared ({ caller }) func postIceCandidate(roomId : RoomId, iceCandidate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post ICE candidates");
    };
    switch (rooms.get(roomId)) {
      case (null) {
        let candidates = List.empty<Text>();
        candidates.add(iceCandidate);
        let newSignalingData : SignalingData = {
          sdpOffer = null;
          sdpAnswer = null;
          iceCandidates = candidates;
        };
        rooms.add(roomId, newSignalingData);
      };
      case (?signalingData) {
        signalingData.iceCandidates.add(iceCandidate);
      };
    };
  };

  public query ({ caller }) func getIceCandidates(roomId : RoomId) : async ?[Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get ICE candidates");
    };
    switch (rooms.get(roomId)) {
      case (?data) { ?data.iceCandidates.toArray() };
      case (null) { null };
    };
  };

  public shared ({ caller }) func postMessage(roomId : RoomId, newMsg : NewMessage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post messages");
    };
    let msg : Message = {
      id = nextMessageId;
      roomId;
      senderName = newMsg.senderName;
      text = newMsg.text;
    };
    messages.add(msg);
    nextMessageId += 1;
  };

  public query ({ caller }) func pollMessagesAfter(lastMsgId : MessageId, roomId : RoomId) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can poll messages");
    };
    var foundLastMsg = false;
    messages.toArray().filter(
      func(msg) {
        if (msg.id > lastMsgId and msg.roomId == roomId) {
          return true;
        } else { return false };
      }
    );
  };

  public shared ({ caller }) func addVideo(title : Text, url : Text, size : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add videos");
    };
    let video = {
      title;
      url;
      size;
    };

    switch (userVideos.get(caller)) {
      case (null) {
        let videos = List.empty<VideoEntry>();
        videos.add(video);
        userVideos.add(caller, videos);
      };
      case (?videos) {
        videos.add(video);
      };
    };
  };

  public query ({ caller }) func getVideos(userId : Principal) : async [VideoEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view videos");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own videos");
    };
    switch (userVideos.get(userId)) {
      case (null) { [] };
      case (?videos) { videos.toArray() };
    };
  };

  public query ({ caller }) func listAllUsers() : async [UserMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list users");
    };
    users.values().toArray().sort();
  };

  public query ({ caller }) func getAllVideosSortedBySize(userId : Principal) : async [VideoEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view videos");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own videos");
    };
    switch (userVideos.get(userId)) {
      case (null) { [] };
      case (?videos) { videos.toArray().sort(VideoEntry.compareBySize) };
    };
  };

  public shared ({ caller }) func deleteVideo(videoTitle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete videos");
    };
    switch (userVideos.get(caller)) {
      case (null) {
        Runtime.trap("No saved videos yet");
      };
      case (?videos) {
        let updatedVideos = videos.filter(func(video) { video.title != videoTitle });
        userVideos.add(caller, updatedVideos);
      };
    };
  };
};
