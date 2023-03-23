export type Event = {
    id: string,
    kind: number,
    pubkey: string,
    sig: string,
    tags: object,
    created_at: number,
    content: string
}