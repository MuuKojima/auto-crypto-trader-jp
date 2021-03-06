/**
  const Foo = {
    bar: 'test1',
    baz: 'test2'
  } as const;
  type foo = valueof<typeOf Foo> // 'test1' | 'test2'
*/
type valueof<T> = T[keyof T];
