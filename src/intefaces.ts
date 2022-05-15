export interface ServerAction {
  app_info: AppInfo;
  action_id: string;
  parameters: object;

  [x: string | number | symbol]: unknown;
}

export interface AppInfo {
  projectId: string;
  applicationId: string;
  appversionId: string;
  frontendEndpoint: string;
  frontendType: AppType;
  systemName: string;
  frontendStateId: string;
}

export interface Character {
  id: 'sber' | 'athena' | 'joy';
  name: 'Сбер' | 'Афина' | 'Джой';
  gender: 'male' | 'female';
  appeal: 'official' | 'no_official';
}

export type MessageType =
  | 'MESSAGE_TO_SKILL'
  | 'SERVER_ACTION'
  | 'RUN_APP'
  | 'CLOSE_APP';

export interface UUID {
  userId: string;
  sub: string;
  userChannel: string;
}

export interface Time {
  timestamp: number;
  timezone_id: string;
  timezone_offset_sec: number;
}

export interface Features {
  screen: boolean; // is enabled
  int_login: boolean; // is enabled
}

export type AppType = 'DIALOG' | 'WEB_APP' | 'APK' | 'CHAT_APP';

export interface Capabilities {
  screen: { available: boolean };
  mic: { available: boolean };
  speak: { available: boolean };
}

export interface Device {
  platformType?: 'ANDROID' | 'IOS';
  platformVersion?: string;
  surface: 'SBERBOX' | 'COMPANION' | 'STARGATE';
  surfaceVersion?: string;
  deviceId?: string;
  features?: { appTypes: AppType[] };
  capabilities: Capabilities;
  additionalInfo?: object;
}

export interface Strategies {
  happy_birthday: boolean;
  last_call: string;
  is_alice?: boolean; // If biometry detects Yandex Alice
}

export type CensorClasses = 'politicians' | 'obscene' | 'model_response';
export type SentimentClasses = 'negative' | 'positive' | 'neutral';

export interface Annotations {
  censor_data: { classes: CensorClasses[]; probas: number[] };
  text_sentiment: { classes: SentimentClasses; probas: number[] };
  asr_sentiment: { classes: SentimentClasses; probas: number[] };
}

export interface Message {
  original_text: string;
  asr_normalized_message: string;
  normalized_text: string;
  entities: any;
  tokenized_elements_list: any[];
}

export interface MESSAGE_TO_SKILL {
  app_info: AppInfo;
  intent: string;
  original_intent: string;
  intent_meta: object; // They will add this later
  meta: { time: Time; features?: Features };
  projectName?: string;
  selected_item: object; // TODO if necessary make a type
  device: Device;
  new_session?: boolean;
  character: Character;
  strategies?: Strategies;
  annotations?: Annotations;
  message: Message;
}

export interface SERVER_ACTION {
  device: Device;
  app_info: AppInfo;
  projectName?: string;
  character: Character;
  strategies?: Strategies;
  server_action: ServerAction;
}

export interface RUN_APP {
  device: Device;
  app_info: AppInfo;
  projectName: string;
  intent: string;
  character: Character;
  strategies?: Strategies;
  server_action: ServerAction;
}

export interface CLOSE_APP {
  app_info: AppInfo;
  intent: string;
  original_intent: string;
  intent_meta: object;
  projectName?: string;
  selected_item: object;
  device: Device;
  new_session?: boolean;
  character: Character;
  strategies?: Strategies;
  annotations?: Annotations;
  message: Message;
}

export type Payload = MESSAGE_TO_SKILL | SERVER_ACTION | RUN_APP | CLOSE_APP;

export interface FullRequest {
  messageName: MessageType;
  sessionId: string;
  messageId: number;
  uuid: UUID;
  payload: Payload;
}
