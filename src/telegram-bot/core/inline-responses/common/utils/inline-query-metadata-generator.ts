import { IKeyBoardEvent } from './keyboard-event.interface';
import { KeyBoardEventsKeys } from '../keyboard-events.enum';

export function InlineQueryMetadataGenerator(
  id: KeyBoardEventsKeys,
  metadata: any,
): string {
  const keyboardEvent: IKeyBoardEvent = {
    id,
    metadata,
  };

  return JSON.stringify(keyboardEvent);
}
