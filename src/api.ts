export class SberRequest {
  type: string;
  body: any;
  nlu: NLU;

  constructor(request: any) {
    this.body = request;
    this.type = request.messageName;
    if (this.type === 'MESSAGE_TO_SKILL') {
      this.nlu = new NLU(this.pld.message.tokenized_elements_list);
    }
  }

  get pld() {
    return this.body.payload;
  }

  get msg() {
    return this.pld.message.original_text;
  }

  get act() {
    return this.pld.server_action;
  }

  get character() {
    return this.pld.character;
  }

  get charGender() {
    return this.pld.character.gender;
  }

  get charName() {
    return this.pld.character.name;
  }

  get device() {
    return this.pld.device;
  }

  get userId() {
    return this.body.sessionId;
  }

  clone(another: SberRequest): any {
    this.body = another.body;
    this.nlu = another.nlu;
  }

  buildRsp() {
    let starter = {
      ...this.body,
      payload: { device: this.device },
    };
    return new SberResponse(starter);
  }
}

export class SberResponse {
  body: any;
  pld: any;

  constructor(starter: any) {
    this.body = starter;
    this.body.messageName = 'ANSWER_TO_USER';
    this.pld = this.body.payload;
  }

  set msg(text: string) {
    console.log(this.pld.items);
    this.pld.items = (this.pld.items || []).filter((obj: any) => !obj.bubble);
    console.log(this.pld.items);
    this.pld.items.push({ bubble: { text } });
    this.pld.pronounceText = text;
  }

  set data(obj: any) {
    this.pld.items = (this.pld.items || []).filter((obj: any) => !obj.command);
    this.pld.items.push({ command: { type: 'smart_app_data', smart_app_data: obj } });
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
  tokens: Array<Token>;
  lemmas: Array<string>;
  types: Array<string>;
  parts: Array<string>;
  texts: Array<string>;

  constructor(elements: any) {
    for (let element of elements) {
      if (!element.hasOwnProperty('grammem_info')) {
        continue;
      }
      let token = new Token(element);
      this.tokens.push(token);
      this.lemmas.push(token.lemma);
      this.types.push(token.type);
      this.parts.push(token.part);
      this.texts.push(token.text);
    }
  }
}
