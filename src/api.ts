/* tslint:disable:max-classes-per-file */
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

  get msg(): string {
    return this.pld.message.original_text;
  }

  get act(): object {
    return this.pld.server_action;
  }

  get character(): object {
    return this.pld.character;
  }

  get charGender(): string {
    return this.pld.character.gender;
  }

  get charName(): string {
    return this.pld.character.name;
  }

  get device(): object {
    return this.pld.device;
  }

  get userId(): string {
    return this.body.sessionId;
  }

  clone(another: SberRequest): any {
    this.body = another.body;
    this.nlu = another.nlu;
  }

  buildRsp() {
    const starter = {
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
    this.pld.items = (this.pld.items || []).filter((v: any) => !v.bubble);
    this.pld.items.push({ bubble: { text } });
    this.pld.pronounceText = text;
  }

  set data(value: any) {
    this.pld.items = (this.pld.items || []).filter((obj: any) => !obj.command);
    this.pld.items.push({ command: { type: 'smart_app_data', smart_app_data: value } });
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
}
