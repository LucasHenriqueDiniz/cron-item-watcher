declare module "discord-webhook-node" {
  export class Webhook {
    constructor(url: string | { url: string; throwErrors?: boolean; retryOnLimit?: boolean });
    setUsername(username: string): this;
    setAvatar(url: string): this;
    send(message: string | MessageBuilder): Promise<void>;
    sendFile(filePath: string): Promise<void>;
    info(title: string, fieldName?: string, fieldValue?: string, inline?: boolean): Promise<void>;
    success(title: string, fieldName?: string, fieldValue?: string, inline?: boolean): Promise<void>;
    warning(title: string, fieldName?: string, fieldValue?: string, inline?: boolean): Promise<void>;
    error(title: string, fieldName?: string, fieldValue?: string, inline?: boolean): Promise<void>;
  }

  export class MessageBuilder {
    constructor();
    setText(text: string): this;
    setAuthor(author: string, authorImage?: string, authorUrl?: string): this;
    setTitle(title: string): this;
    setURL(url: string): this;
    setThumbnail(thumbnail: string): this;
    setImage(image: string): this;
    setTimestamp(date?: number | Date): this;
    setColor(color: string | number): this;
    setDescription(description: string): this;
    addField(fieldName: string, fieldValue: string, inline?: boolean): this;
    setFooter(footer: string, footerImage?: string): this;
    readonly embeds: {
      thumbnail?: { url: string };
      image?: { url: string };
      [key: string]: any;
    }[];
  }
}
