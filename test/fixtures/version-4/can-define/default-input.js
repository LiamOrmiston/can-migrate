let ViewModel = DefineMap.extend({
  myProp: {
    value: 'something'
  },
  myOtherProp: {
    set(value) {
      return value;
    }
  },
  myFunc(el) {
    return el.value
  },
  myFunc2(el) {
    return {
      value: el.value
    };
  }
});

let ViewModelTwo = DefineMap.extend("NamedDefineMap", {
  myProp: {
    value: 'something'
  },
  myOtherProp: {
    set(value) {
      return value;
    }
  },
  myFunc(el) {
    return el.value
  },
  myFunc2(el) {
    return {
      value: el.value
    };
  }
});

let ViewModel = new DefineMap({
  myProp: {
    value: 'something'
  }
});

let obj = {
  myProp: {
    value: 'something else'
  }
}

let AnotherVM = Something.extend({
  myProp: {
    value: 'something'
  }
});
