export type SubscriberType = (...params: any) => void;

export class Publisher {
  public subscribers: { [key: string]: SubscriberType[] };

  constructor() {
    this.subscribers = {};
  }

  addSubscriber(event: string, ...subscribers: SubscriberType[]) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(...subscribers);
  }

  getSubscribers(event: string): Readonly<SubscriberType[]> {
    return this.subscribers[event];
  }

  notifySubscriber(event: string, ...params: any[]) {
    if (!this.subscribers[event]) {
      return;
    }

    this.subscribers[event].forEach(subs => {
      subs.call(null, ...params);
    });
  }
}
