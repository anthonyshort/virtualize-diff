var zip = require('compute-zip');
var equal = require('equals');

/**
 * Get the diff of two simple trees. Nodes within the tree
 * need to have a number of properties:
 *
 *  - type: Defines the type of node
 *  - attributes: Properties of the node
 *  - children: An array of child nodes of the same time
 *  - key: A unique identifier that can be used on each pass to optimize the diff
 *
 * This returns an array of changes.
 *
 * @param {Object} left
 * @param {Object} right
 *
 * @return {Array}
 */

module.exports = function(left, right) {
  return diffNode(left, right);
};

/**
 * Compare two nodes
 *
 * @param {Object} left
 * @param {Object} right
 * @param {String} path
 * @param {Array} patch
 *
 * @return {Array} The updated patch
 */
function diffNode(left, right, optPath, optPatch) {

  // Skip everything.
  if (left === right) {
    return patch;
  }

  var path = optPath || '0';
  var patch = optPatch || [];

  // Type of node has changed
  if (left.type !== right.type) {
    patch.push({
      path: path,
      left: left,
      right: right,
      type: 'node.replace'
    });
    return patch;
  }

  // Add/remove attributes
  diffAttributes(left, right, path, patch);

  // Recursive
  diffChildren(left, right, path, patch);

  return patch;
}

/**
 * Shallow diff the attributes and add/remove them.
 */

function diffAttributes(left, right, path, patch){
  var rightAttrs = right.attributes || {};
  var leftAttrs = left.attributes || {};

  // add new attrs / update attrs
  for (var name in rightAttrs) {
    var rightValue = rightAttrs[name];
    var leftValue = leftAttrs[name];
    if (!leftAttrs[name]) {
      patch.push({
        path: path,
        name: name,
        value: rightValue,
        type: 'attribute.add'
      });
    } else if (leftAttrs[name] !== rightValue) {
      patch.push({
        path: path,
        name: name,
        value: rightValue,
        oldValue: leftValue,
        type: 'attribute.update'
      });
    }
  }

  // remove old attrs
  for (var oldName in leftAttrs) {
    if (!rightAttrs[oldName]) {
      patch.push({
        path: path,
        name: oldName,
        type: 'attribute.remove'
      });
    }
  }
}

/**
 * Diff the children of an ElementNode.
 */

function diffChildren(leftNode, rightNode, path, patch){
  var leftChildren = leftNode.children || [];
  var rightChildren = rightNode.children || [];
  var children = zip(leftChildren, rightChildren, { trunc: false });

  var j = -1;
  for (var i = 0; i < children.length; i++) {
    j += 1;

    var childPath = path + '.' + j;
    var item = children[i];
    var left = item[0];
    var right = item[1];

    // this is a new node.
    if (left == null) {
      patch.push({
        path: childPath,
        node: right,
        type: 'node.add'
      });
      continue;
    }

    // the node has been removed.
    if (right == null) {
      patch.push({
        path: childPath,
        node: left,
        type: 'node.remove'
      });
      j = j - 1;
      continue;
    }

    // Diff them.
    diffNode(left, right, childPath, patch);
  }

  // Reorder nodes last
  // if (equal(leftOrder, rightOrder) === false) {
  //   patch.push({
  //     path: path,
  //     left: leftOrder,
  //     right: rightOrder,
  //     type: 'node.reorderChildren'
  //   });
  // }
}