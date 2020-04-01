import { Publisher } from './observer-pattern';

describe('ObserverPattern', () => {
  let publisher: Publisher;

  beforeEach(() => {
    publisher = new Publisher();
  });

  it('should create the instance', () => {
    expect(publisher).toBeDefined();
  });

  describe('Add Subscriber', () => {
    let event: string;

    beforeEach(() => {
      event = 'randomEvent';
    });

    it('should add a subscriber', () => {
      const newSubs = jest.fn();

      publisher.addSubscriber(event, newSubs);

      expect(publisher.getSubscribers(event)).toEqual([newSubs]);
    });

    it('should push a add a subscriber when ', () => {
      const newSubs = jest.fn();
      const newSubs2 = jest.fn();

      publisher.addSubscriber(event, newSubs, newSubs2);

      expect(publisher.getSubscribers(event)).toEqual([newSubs, newSubs2]);
    });

    it('should add the subscriber to the right event', () => {
      const newSubs = jest.fn();
      const newSubs2 = jest.fn();

      publisher.addSubscriber(event, newSubs);
      publisher.addSubscriber('another Event', newSubs2);

      expect(publisher.getSubscribers(event)).toEqual([newSubs]);
    });
  });

  describe('Notify Subscribers', () => {
    let event1: string, event2: string;
    let event1Subs1: jest.Mock;
    let event1Subs2: jest.Mock;
    let event2Subs1: jest.Mock;

    beforeEach(() => {
      event1 = 'event1';
      event2 = 'event2';

      event1Subs1 = jest.fn();
      event1Subs2 = jest.fn();
      event2Subs1 = jest.fn();

      publisher.addSubscriber(event1, event1Subs1, event1Subs2);
      publisher.addSubscriber(event2, event2Subs1);
    });

    it('should notify the right subscribers given an event', () => {
      publisher.notifySubscriber(event1);

      expect(event1Subs1).toHaveBeenCalled();
      expect(event1Subs2).toHaveBeenCalled();
      expect(event2Subs1).not.toHaveBeenCalled();
    });

    it('should send the right parameters when notifying', () => {
      publisher.notifySubscriber(event2, 'a', 'b', 'c');

      expect(event1Subs1).not.toHaveBeenCalled();
      expect(event1Subs2).not.toHaveBeenCalled();
      expect(event2Subs1).toHaveBeenCalledWith('a', 'b', 'c');
    });

    it('should notify the subscribers only once', () => {
      publisher.notifySubscriber(event2);

      expect(event1Subs1).not.toHaveBeenCalled();
      expect(event1Subs2).not.toHaveBeenCalled();
      expect(event2Subs1).toHaveBeenCalledTimes(1);
    });

    it("should do nothing if the event doesn't exists", () => {
      publisher.notifySubscriber('super random event');

      expect(event1Subs1).not.toHaveBeenCalled();
      expect(event1Subs2).not.toHaveBeenCalled();
      expect(event2Subs1).not.toHaveBeenCalled();
    });
  });
});
