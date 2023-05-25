import { $query, $update, Record, StableBTreeMap, Variant, Vec, nat32, match } from 'azle';

/**
 * This type represents a message that can be listed on a board.
 */
type Message = Record<{
    id: string;
    title: string;
    body: string;
    attachmentURL: string;
}>;

type MessagePayload = Record<{
    title: string;
    body: string;
    attachmentURL: string;
}>;

type Response = Variant<{
    error: string;
    message: Message;
    messages: Vec<Message>;
    id: string;
}>;

let idCounter: nat32 = 0;

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
 * 2) 16 - it's a max size of the key in bytes.
 * 3) 1024 - it's a max size of the value in bytes. 
 * 2 and 3 are not being used directly in the constructor but the Azle compiler utilizes these values during compile time
 */
const messageStorage = new StableBTreeMap<string, Message>(0, 16, 1024);

$query;
export function getMessages(): Response {
    return { messages: messageStorage.values() };
}

$query;
export function getMessage(id: string): Response {
    let response: Response;
    return match(messageStorage.get(id), {
        Some: (message) => response = { message: message },
        None: () => response = { error: `a message with id=${id} not found` }
    });
}

$update;
export function addMessage(payload: MessagePayload): Response {
    if (typeof payload != 'object' || Object.keys(payload).length === 0) {
        return { error: `invalid payload` };
    }
    const id = ++idCounter;
    let message: Message = { id: id.toString(), ...payload };
    messageStorage.insert(message.id, message);
    return { message };
};

$update;
export function updateMessage(payload: Message): Response {
    let response: Response;
    return match(messageStorage.get(payload.id), {
        Some: (message) => {
            messageStorage.insert(message.id, payload);
            return response = { message: payload };
        },
        None: () => response = { error: `couldn't update a message with id=${payload.id}. message not found` }
    });
};

$update;
export function deleteMessage(id: string): Response {
    let response: Response;
    return match(messageStorage.remove(id), {
        Some: (deletedMessage) => response = { id: deletedMessage.id },
        None: () => response = { error: `couldn't delete a message with id=${id}. message not found.` }
    });
};