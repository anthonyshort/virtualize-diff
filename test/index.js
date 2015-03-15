mocha.setup({globals: ['hasCert']});

var assert = require('assert');
var diff = require('../');

describe('Object Tree Diff', function(){

  var left = {
    type: 'foo',
    attributes: {
      hello: 'world'
    }
  };

  var node1 = {
    type: 'bar'
  };

  var node2 = {
    type: 'baz'
  };

  var node3 = {
    type: 'foo'
  };

  it('should return empty changes if nothing changes', function () {
    var changes = diff(left, {
      type: 'foo',
      attributes: {
        hello: 'world'
      }
    });
    assert(Array.isArray(changes));
    assert(changes.length === 0);
  });

  it('should return a change when the type changes', function () {
    var right = { type: 'bar' };
    var changes = diff(left, right);
    assert.deepEqual(changes, [{
      path: '0',
      left: left,
      right: right,
      type: 'node.replace'
    }]);
  });

  it('should return a change when the type changes to a function', function () {
    function Component(){}
    var right = { type: Component };
    var changes = diff(left, right);
    assert.deepEqual(changes, [{
      path: '0',
      left: left,
      right: right,
      type: 'node.replace'
    }]);
  });

  it('should return a change when the type changes to another function', function () {
    function ComponentA(){}
    function ComponentB(){}
    var left = { type: ComponentA };
    var right = { type: ComponentB };
    var changes = diff(left, right);
    assert.deepEqual(changes, [{
      path: '0',
      left: left,
      right: right,
      type: 'node.replace'
    }]);
  });

  it('should return a change for updated attributes', function () {
    var changes = diff(left, {
      type: 'foo',
      attributes: {
        hello: 'pluto'
      }
    });
    assert.deepEqual(changes, [{
      path: '0',
      name: 'hello',
      value: 'pluto',
      oldValue: 'world',
      type: 'attribute.update'
    }]);
  });

  it('should return changes for multiple updated attributes', function () {
    var changes = diff(left, {
      type: 'foo',
      attributes: {
        hello: 'pluto',
        raz: 'mataz'
      }
    });
    assert.deepEqual(changes, [{
      path: '0',
      name: 'hello',
      value: 'pluto',
      oldValue: 'world',
      type: 'attribute.update'
    }, {
      path: '0',
      name: 'raz',
      value: 'mataz',
      type: 'attribute.add'
    }]);
  });

  it('should return a change for removed attributes', function () {
    var changes = diff(left, {
      type: 'foo'
    });
    assert.deepEqual(changes, [{
      path: '0',
      name: 'hello',
      type: 'attribute.remove'
    }]);
  });

  it('should return a change for new attributes', function () {
    var changes = diff(left, {
      type: 'foo',
      attributes: {
        hello: 'world',
        foo: 'bar'
      }
    });
    assert.deepEqual(changes, [{
      path: '0',
      name: 'foo',
      value: 'bar',
      type: 'attribute.add'
    }]);
  });

  it('should return changes for added children', function () {
    var child = {
      type: 'bar'
    };
    var right = {
      type: 'foo',
      attributes: {
        hello: 'world'
      },
      children: [child]
    };
    var changes = diff(left, right);
    assert.deepEqual(changes, [{
      path: '0.0',
      node: child,
      type: 'node.add'
    }]);
  });

  it('should return changes for removed children', function () {
    var child = {
      type: 'bar'
    };
    var right = {
      type: 'foo',
      attributes: {
        hello: 'world'
      },
      children: [child]
    };
    var changes = diff(right, left);
    assert.deepEqual(changes, [{
      path: '0.0',
      node: child,
      type: 'node.remove'
    }]);
  });

  it('should return changes for complex removed children', function () {
    var left = {
      type: 'foo',
      attributes: {
        hello: 'world'
      },
      children: [node1,node2,node3]
    }
    var right = {
      type: 'foo',
      attributes: {
        hello: 'world'
      },
      children: [node1,node3]
    };
    var changes = diff(left, right);
    assert.deepEqual(changes, [{
      path: '0.1',
      left: node2,
      right: node3,
      type: 'node.replace'
    }, {
      path: '0.2',
      node: node3,
      type: 'node.remove'
    }]);
  });

  it('should return changes for complex add children', function () {
    var left = {
      type: 'foo',
      attributes: {
        hello: 'world'
      },
      children: [node1,node2,node3]
    }
    var right = {
      type: 'foo',
      attributes: {
        hello: 'world'
      },
      children: [node1,node3]
    };
    var changes = diff(right, left);
    assert.deepEqual(changes, [{
      path: '0.1',
      left: node3,
      right: node2,
      type: 'node.replace'
    }, {
      path: '0.2',
      node: node3,
      type: 'node.add'
    }]);
  });

  // it('should return changes for deeply complex children', function () {
  //   var slug = {
  //     type: 'slug'
  //   };
  //   var raz = {
  //     type: 'raz'
  //   };
  //   var baz = {
  //     type: 'baz'
  //   };
  //   var left = {
  //     type: 'foo',
  //     children: [{
  //       type: 'raz',
  //       attributes: {
  //         hello: 'world'
  //       }
  //     },{
  //       type: 'bar',
  //       children: [baz]
  //     }]
  //   };
  //   var right = {
  //     type: 'foo',
  //     children: [{
  //       type: 'raz',
  //       attributes: {
  //         hello: 'pluto'
  //       },
  //       children: [slug]
  //     },{
  //       type: 'bar',
  //       children: [raz, baz]
  //     }]
  //   };
  //   var changes = diff(left, right);
  //   assert.deepEqual(changes, [{
  //     path: '0.0',
  //     name: 'hello',
  //     value: 'pluto',
  //     oldValue: 'world',
  //     type: 'attribute.update'
  //   }, {
  //     path: '0.0.0',
  //     type: 'node.add',
  //     node: slug
  //   }, {
  //     path: '0.1.0',
  //     type: 'node.replace',
  //     left: baz,
  //     right: raz
  //   }, {
  //     path: '0.1.1',
  //     type: 'node.add',
  //     node: baz
  //   }]);
  // });

  // it.skip('should move children', function () {
  //   var one = { key: '1', type: 'bar' };
  //   var two = { key: '2', type: 'foo' };

  //   var left = {
  //     type: 'element',
  //     children: [one, two]
  //   };

  //   var right = {
  //     type: 'element',
  //     children: [two, one]
  //   };

  //   var changes = diff(left, right);

  //   assert.deepEqual(changes, [{
  //     path: '0',
  //     node: left,
  //     from: 0,
  //     to: 1
  //     type: 'node.move'
  //   }, {
  //     path: '0',
  //     node: right,
  //     from: 1,
  //     to: 0
  //     type: 'node.move'
  //   }]);
  // });

});
