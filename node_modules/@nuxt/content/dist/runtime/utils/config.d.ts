/**
 * Creates a predicate to test storage keys `foo:bar:baz` against configured `ignores` patterns
 */
export declare function makeIgnored(ignores: string[], experimental?: boolean): (key: string) => boolean;
