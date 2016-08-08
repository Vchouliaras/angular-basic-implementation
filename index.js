'use strict';

// Framework, define what is Scope all about.
var Scope = function() {
  var that = this;

  // Make $$directives private.
  var $$directives = {
    'ng-bind': function($scope, element, attributes) {
      $scope.$watch(function() {
        return $scope[attributes['ng-bind'].value];
      }, function(newvalue, oldvalue) {
        element.innerHTML = newvalue;
      });
    },
    'ng-model': function($scope, element, attributes) {
      $scope.$watch(function() {
        return $scope[attributes['ng-model'].value];
      }, function(newvalue, oldvalue) {
        element.value = newvalue;
      });
      element.addEventListener('keyup', function(){
        $scope.$apply(function(){
          $scope[attributes['ng-model'].value] = element.value;
        });
      });
    }
  };

  // Register $$watchers
  var $$watchers = [];
  this.$watch = function(watcherFn, listenerFn) {
    $$watchers.push({
      watcherFn: watcherFn,
      listenerFn: listenerFn
    });
  };

  // Add $digest
  this.$digest = function() {
    $$watchers.forEach(function(watcher) {
      var newValue = watcher.watcherFn();
      var oldValue = watcher.last || 'nothing';
      if (newValue !== oldValue) {
        watcher.listenerFn(newValue, oldValue);
        watcher.last = newValue;
      }
    });
  };

  // Add $apply, runs after $digest.
  this.$apply = function(exprFun) {
    exprFun();
    this.$digest();
  };

  // Register the $compile process.
  this.$compile = function(element, $scope) {
    Array.prototype.forEach.call(element.children, function(child) {
      that.$compile(child, $scope);
    });
    Array.prototype.forEach.call(element.attributes, function(attribute) {
      var directive = $$directives[attribute.name];
      if (directive) {
        directive($scope, element, element.attributes);
      }
    });
  };
};


var $scope = new Scope();

// Step 1

// This step traverses DOM elements and checks for ng-xxx atrributes.
// Then it registers the watchers for its element if exists.
$scope.$compile(document.body, $scope);

// Step 2

// Runs Digest Cycle, and trigger listeners only when values changes.
$scope.$digest();
