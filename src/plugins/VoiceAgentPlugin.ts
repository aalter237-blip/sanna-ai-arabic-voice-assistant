import { registerPlugin } from "@capacitor/core";
export interface VoiceAgentPlugin {
  tap(o:{x:number;y:number}):Promise<void>;
  swipe(o:{x1:number;y1:number;x2:number;y2:number;duration?:number}):Promise<void>;
  clickByText(o:{text:string}):Promise<{success:boolean}>;
  clickById(o:{viewId:string}):Promise<{success:boolean}>;
  getScreenText():Promise<{texts:string[]}>;
  inputText(o:{text:string}):Promise<{success:boolean}>;
  isServiceEnabled():Promise<{enabled:boolean}>;
  isAccessibilityEnabled():Promise<{enabled:boolean}>;
  openAccessibilitySettings():Promise<void>;
  launchApp(o:{packageName:string}):Promise<{success:boolean}>;
  setVolume(o:{percent:number}):Promise<{success:boolean}>;
  setAlarm(o:{time:string;label?:string}):Promise<{success:boolean}>;
  performGlobalAction(o:{action:string}):Promise<{success:boolean}>;
  startBackgroundListening(o?:{wakeWords?:string[]}):Promise<{success:boolean}>;
  stopBackgroundListening():Promise<{success:boolean}>;
  requestAppPermissions():Promise<{success:boolean}>;
  getNotifications():Promise<{items:any[];enabled:boolean}>;
  openNotificationListenerSettings():Promise<void>;
  replyLastNotification(o:{text:string}):Promise<{success:boolean}>;
}
export const VoiceAgent = registerPlugin<VoiceAgentPlugin>("VoiceAgent");
export default VoiceAgent;
