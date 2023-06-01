import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

/**
 * This type represents a message that can be listed on a board.
 */
type Message = Record<{
    id: string;
    title: string;
    body: string;
    attachmentURL: string;
    created_at: nat64;
    updated_at: Opt<nat64>;
}>

type MessagePayload = Record<{
    title: string;
    body: string;
    attachmentURL: string;
}>

/**
 * `messageStorage` - it's a key-value datastructure that is used to store messages.
 * {@link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data across canister upgrades.
 * For the sake of this contract we've chosen {@link StableBTreeMap} as a storage for the next reasons:
 * - `insert`, `get` and `remove` operations have a constant time complexity - O(1)
 * 
 * Brakedown of the `StableBTreeMap<string, Message>` datastructure:
 * - the key of map is a `messageId`
 * - the value in this map is a message itself `Message` that is related to a given key (`messageId`)
 * 
 * Constructor values:
 * 1) 0 - memory id where to initialize a map
 * 2) 44 - it's a max size of the key in bytes (size of the uuid value that we use for ids).
 * 3) 1024 - it's a max size of the value in bytes. 
 * 2 and 3 are not being used directly in the constructor but the Azle compiler utilizes these values during compile time
 */
const messageStorage = new StableBTreeMap<string, Message>(0, 44, 1024);

$query;
export function getMessages(): Result<Vec<Message>, string> {
    return Result.Ok(messageStorage.values());
}

$query;
export function getMessage(id: string): Result<Message, string> {
    return match(messageStorage.get(id), {
        Some: (message) => Result.Ok<Message, string>(message),
        None: () => Result.Err<Message, string>(`a message with id=${id} not found`)
    });
}

$update;
export function addMessage(payload: MessagePayload): Result<Message, string> {
    const message: Message = { id: uuidv4(), created_at: ic.time(), updated_at: Opt.None, ...payload };
    messageStorage.insert(message.id, message);
    return Result.Ok(message);
}

$update;
export function updateMessage(id: string, payload: MessagePayload): Result<Message, string> {
    return match(messageStorage.get(id), {
        Some: (message) => {
            const updatedMessage: Message = {...message, ...payload, updated_at: Opt.Some(ic.time())};
            messageStorage.insert(message.id, updatedMessage);
            return Result.Ok<Message, string>(updatedMessage);
        },
        None: () => Result.Err<Message, string>(`couldn't update a message with id=${id}. message not found`)
    });
}

$update;
export function deleteMessage(id: string): Result<Message, string> {
    return match(messageStorage.remove(id), {
        Some: (deletedMessage) => Result.Ok<Message, string>(deletedMessage),
        None: () => Result.Err<Message, string>(`couldn't delete a message with id=${id}. message not found.`)
    });
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
