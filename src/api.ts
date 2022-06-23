/* tslint:disable:max-classes-per-file */
import type {
  ServerAction,
  MessageType,
  Payload,
  FullRequest,
  MESSAGE_TO_SKILL,
  Message,
  SERVER_ACTION,
  Character,
  Device,
} from './intefaces';

export class SberRequest {
  body: FullRequest;
  nlu: NLU;

  constructor(request: any) {
    this.body = request;
    if (this.type === 'MESSAGE_TO_SKILL') {
      this.nlu = new NLU(
        (this.pld as MESSAGE_TO_SKILL).message.tokenized_elements_list
      );
    }
  }

  get type(): MessageType {
    return this.body.messageName;
  }

  get pld(): Payload {
    return this.body.payload;
  }

  get msg(): string | undefined {
    if (this.type === 'MESSAGE_TO_SKILL' || this.type === 'CLOSE_APP') {
      return (this.pld as MESSAGE_TO_SKILL).message.original_text;
    }
  }

  get msgFull(): Message | undefined {
    if (this.type === 'MESSAGE_TO_SKILL' || this.type === 'CLOSE_APP') {
      return (this.pld as MESSAGE_TO_SKILL).message;
    }
  }

  get act(): ServerAction | undefined {
    if (this.type === 'SERVER_ACTION') {
      return (this.pld as SERVER_ACTION).server_action;
    }
  }

  get char(): Character {
    return this.pld.character;
  }

  get charGender(): string {
    return this.pld.character.gender;
  }

  get charName(): string {
    return this.pld.character.name;
  }

  get device(): Device {
    return this.pld.device;
  }

  get userId(): string {
    // return this.body.sessionId; Always changes on SberPortal for each message!
    return this.body.uuid.userId;
    // return this.body.uuid.sub;
  }

  clone(another: SberRequest) {
    this.body = another.body;
    this.nlu = another.nlu;
  }

  buildRsp(): SberResponse {
    return new SberResponse(this);
  }
}

export class SberResponse {
  request: SberRequest;
  body: any;
  pld: any;

  constructor(request: SberRequest) {
    this.request = request;
    this.body = {
      ...request.body,
      payload: { device: request.device },
    };
    this.body.messageName = 'ANSWER_TO_USER';
    this.pld = this.body.payload;
    this.pld.items = [];
  }

  set msg(text: string) {
    this.pld.items = this.pld.items.filter((v: any) => !v.bubble);
    this.pld.items.push({ bubble: { text } });
    this.pld.pronounceText = text;
  }

  set msgJ(text: string) {
    if (this.request.pld.character.id === 'joy') {
      this.msg = text;
    }
  }

  set msgS(text: string) {
    if (this.request.pld.character.id === 'sber') {
      this.msg = text;
    }
  }

  set msgA(text: string) {
    if (this.request.pld.character.id === 'athena') {
      this.msg = text;
    }
  }

  set data(value: any) {
    this.pld.items = this.pld.items.filter((obj: any) =>
      obj.command ? obj.command.type.smart_app_data : true
    );
    this.pld.items.push({
      command: { type: 'smart_app_data', smart_app_data: value },
    });
  }

  set act(value: any) {
    this.pld.items = this.pld.items.filter((obj: any) =>
      obj.command ? obj.command.type.action : true
    );
    this.pld.items.push({ command: { type: 'action', action: value } });
  }

  set kbrd(buttons: string[]) {
    const formed = [];
    for (const button of buttons) {
      formed.push({ title: button, action: { text: button, type: 'text' } });
    }

    this.pld.suggestions = this.pld.suggestions || {};
    this.pld.suggestions.buttons = formed;
    // {'title': obj.text, 'action': {'text': obj.text, 'type': 'text'}}
  }

  set end(value: boolean) {
    this.pld.finished = value;
  }

  get end(): boolean {
    return this.pld.finished || false;
  }

  set listen(value: boolean) {
    this.pld.auto_listening = value;
  }

  estimate(): SberResponse {
    let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    clone.body.messageName = 'CALL_RATING';
    clone.pld = {};
    return clone;
  }
}

class Token {
  part: string;
  type: string;
  lemma: string;
  text: string;

  constructor(token: any) {
    this.part = token.grammem_info.part_of_speech;
    this.type = token.token_type;
    this.lemma = token.lemma;
    this.text = token.text;
  }
}

class NLU {
  tokens: Token[] = [];
  lemmas: string[] = [];
  types: string[] = [];
  parts: string[] = [];
  texts: string[] = [];

  constructor(elements: any) {
    for (const element of elements) {
      if (!element.hasOwnProperty('grammem_info')) {
        continue;
      }
      const token = new Token(element);
      this.tokens.push(token);
      this.lemmas.push(token.lemma);
      this.types.push(token.type);
      this.parts.push(token.part);
      this.texts.push(token.text);
    }
  }

  lemmaIntersection(lemmas: string[]) {
    const lemmasSet = new Set(this.lemmas);
    let counter = 0;
    for (const lemma of lemmas) {
      if (lemmasSet.has(lemma)) {
        counter++;
      }
    }
    return counter;
  }

  lIn(lemmas: string[]) {
    return this.lemmaIntersection(lemmas);
  }
}
