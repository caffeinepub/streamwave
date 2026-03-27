import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewMessage {
    text: string;
    senderName: string;
}
export interface UserMetadata {
    username: string;
    avatarUrl?: string;
}
export type MessageId = bigint;
export interface VideoEntry {
    url: string;
    title: string;
    size: bigint;
}
export type RoomId = bigint;
export interface Message {
    id: MessageId;
    text: string;
    senderName: string;
    roomId: RoomId;
}
export interface UpdateProfile {
    username: string;
    avatarUrl: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVideo(title: string, url: string, size: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRoom(): Promise<RoomId>;
    deleteVideo(videoTitle: string): Promise<void>;
    getAllVideosSortedBySize(userId: Principal): Promise<Array<VideoEntry>>;
    getCallerProfile(): Promise<UserMetadata | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIceCandidates(roomId: RoomId): Promise<Array<string> | null>;
    getSdpAnswer(roomId: RoomId): Promise<string | null>;
    getSdpOffer(roomId: RoomId): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserMetadata | null>;
    getVideos(userId: Principal): Promise<Array<VideoEntry>>;
    initializeUser(username: string, avatarUrl: string | null): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<UserMetadata>>;
    pollMessagesAfter(lastMsgId: MessageId, roomId: RoomId): Promise<Array<Message>>;
    postIceCandidate(roomId: RoomId, iceCandidate: string): Promise<void>;
    postMessage(roomId: RoomId, newMsg: NewMessage): Promise<void>;
    postSdpAnswer(roomId: RoomId, sdpAnswer: string): Promise<void>;
    postSdpOffer(roomId: RoomId, sdpOffer: string): Promise<void>;
    saveCallerProfile(profile: UpdateProfile): Promise<void>;
    searchUsersByUsername(username: string): Promise<Array<UserMetadata>>;
}
