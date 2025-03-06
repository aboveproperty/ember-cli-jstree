import { getOwner } from '@ember/application';
import { A, isArray } from '@ember/array';
import { action } from '@ember/object';
import { isPresent, isNone, typeOf } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { runTask, scheduleTask } from 'ember-lifeline';
import jQuery from 'jquery';

import { warn } from '@ember/debug';
import { buildWaiter } from '@ember/test-waiters';

const waiter = buildWaiter('ember-cli-jstree:ember-jstree-waiter');

export default class EmberJstree extends Component {
  // Properties for Ember communication
  @tracked _selectedNodes = null;
  get selectedNodes() {
    return this._selectedNodes;
  }

  set selectedNodes(selectedNodes) {
    this._selectedNodes = selectedNodes;
    this.args.onUpdateSelectedNodes?.(selectedNodes);
  }

  // Basic configuration objects
  get data() {
    return this.args.data || [];
  }

  get plugins() {
    return this.args.plugins || [];
  }

  get themes() {
    return this.args.themes || [];
  }

  get checkCallback() {
    return this.args.checkCallback ?? true;
  }

  get multiple() {
    return this.args.multiple ?? true;
  }

  get worker() {
    return this.args.worker ?? true;
  }

  // Refresh configuration variables
  get skipLoading() {
    return this.args.skipLoading;
  }

  get forgetState() {
    return this.args.forgetState;
  }

  // Plugin option objects
  get checkboxOptions() {
    return this.args.checkboxOptions;
  }

  get contextmenuOptions() {
    return this.args.contextmenuOptions;
  }

  get typesOptions() {
    return this.args.typesOptions;
  }

  get searchOptions() {
    return this.args.searchOptions;
  }

  get dndOptions() {
    return this.args.dndOptions;
  }

  get sort() {
    return this.args.sort;
  }

  @tracked selectionDidChange = null;
  @tracked treeObject = null;

  // Internals
  @tracked _isDestroying = false;
  @tracked _searchTerm = null;
  @tracked _isReady = false;

  get isReady() {
    return this._isReady;
  }

  set isReady(value) {
    this._isReady = value;
    if (this.testWaiterToken) {
      waiter.endAsync(this.testWaiterToken);
      this.testWaiterToken = null;
    }
  }

  get isTesting() {
    return (
      getOwner(this).resolveRegistration('config:environment').environment ===
      'test'
    );
  }

  @action
  createTree(element) {
    if (this.isTesting) {
      // Add test waiter.
      this.testWaiterToken = waiter.beginAsync();
    }

    let treeObject = this._setupJsTree(element);

    this._setupEventHandlers(treeObject);

    this.treeObject = treeObject;
    this.args.onSetupActionReceiver?.(this);
  }

  @action
  teardownJsTree() {
    this.isReady = false;
    this._isDestroying = true;
    this.handleDestroy();
  }

  @action
  updateSearch() {
    let pluginsArray = this.plugins;
    let searchOptions = this.searchOptions;
    if (!isPresent(pluginsArray) || !isPresent(searchOptions)) {
      return;
    }

    if (pluginsArray.includes('search')) {
      const searchTerm = this.args.searchTerm;
      if (this._searchTerm !== searchTerm) {
        scheduleTask(this, 'actions', () => {
          this._searchTerm = searchTerm;
          this.getTree().search(searchTerm);
        });
      }
    }
  }

  /**
   * Main setup function that registers all the plugins and sets up the core
   * configuration object for jsTree
   *
   * @method _setupJsTree
   */
  _setupJsTree(element) {
    /* eslint-disable ember/no-jquery */
    return jQuery(element).jstree(this._buildConfig());
    /* eslint-enable ember/no-jquery */
  }

  /**
   * Builds config object for jsTree. Could be used to override config in descendant classes.
   *
   * @method _buildConfig
   */
  _buildConfig() {
    const configObject = {};

    configObject.core = {
      data: this.data,
      check_callback: this.checkCallback,
      multiple: this.multiple,
      worker: this.worker,
    };

    let themes = this.themes;
    if (isPresent(themes) && typeOf(themes) === 'object') {
      configObject.core.themes = themes;
    }

    let pluginsArray = this.plugins;
    if (isPresent(pluginsArray)) {
      pluginsArray = pluginsArray.replace(/ /g, '').split(',');
      configObject.plugins = pluginsArray;

      if (
        pluginsArray.includes('contextmenu') ||
        pluginsArray.includes('dnd') ||
        pluginsArray.includes('unique')
      ) {
        // These plugins need core.check_callback
        configObject.core.check_callback =
          configObject.core.check_callback || true;
      }

      let checkboxOptions = this.checkboxOptions;
      if (isPresent(checkboxOptions) && pluginsArray.includes('checkbox')) {
        configObject.checkbox = checkboxOptions;
      }

      let searchOptions = this.searchOptions;
      if (isPresent(searchOptions) && pluginsArray.includes('search')) {
        configObject.search = searchOptions;
      }

      let sort = this.sort;
      if (isPresent(sort) && pluginsArray.includes('sort')) {
        configObject.sort = sort;
      }

      let stateOptions = this.stateOptions;
      if (isPresent(stateOptions) && pluginsArray.includes('state')) {
        configObject.state = stateOptions;
      }

      let typesOptions = this.typesOptions;
      if (isPresent(typesOptions) && pluginsArray.includes('types')) {
        configObject.types = typesOptions;
      }

      let contextmenuOptions = this.contextmenuOptions;
      if (
        isPresent(contextmenuOptions) &&
        pluginsArray.includes('contextmenu')
      ) {
        configObject.contextmenu = this._setupContextMenus(contextmenuOptions);
      }

      let dndOptions = this.dndOptions;
      if (isPresent(dndOptions) && pluginsArray.includes('dnd')) {
        configObject.dnd = dndOptions;
      }
    }

    return configObject;
  }

  /**
   * Setup context menu action handlers to handle ember actions
   *
   * @method _setupContextMenus
   * @param  {Array} contextmenuOptions Context menu configuration options
   * @return {Array} An Array of Ember-friendly options to pass back into the config object
   */
  _setupContextMenus(contextmenuOptions) {
    if (typeOf(contextmenuOptions.items) === 'object') {
      let newMenuItems = {};
      let menuItems = Object.keys(contextmenuOptions['items']);
      for (let menuItem of menuItems) {
        let itemData = contextmenuOptions.items[menuItem];
        newMenuItems[menuItem] = itemData;

        // Only change if not a function
        // This needs to be done to handle Ember actions
        if (typeOf(itemData.action) !== 'function') {
          let emberAction = itemData.action;

          newMenuItems[menuItem].action = (data) => {
            this.contextmenuItemDidClick(emberAction, data);
          };
        }
      }

      contextmenuOptions.items = newMenuItems;
    }

    return contextmenuOptions;
  }

  /**
   * Register all sorts of events
   * TODO: This should eventually encompass all of the jsTree events declared in their API.
   *
   * @method _setupEventHandlers
   * @param  {Object}
   * @return
   */
  _setupEventHandlers(treeObject) {
    if (typeof treeObject !== 'object') {
      throw new Error(
        'You must pass a valid jsTree object to set up its event handlers'
      );
    }

    /*
      Event: init.jstree
      Action: eventDidInit
      triggered after all events are bound
    */
    treeObject.on('init.jstree', () =>
      runTask(this, () => this.callAction('eventDidInit'), 1)
    );

    /*
      Event: loading.jstree
      Action: eventIsLoading
      triggered after the loading text is shown and before loading starts
    */
    treeObject.on('loading.jstree', () =>
      runTask(this, () => this.callAction('eventIsLoading'), 1)
    );

    /*
      Event: loaded.jstree
      Action: eventDidLoad
      triggered after the root node is loaded for the first time
    */
    treeObject.on('loaded.jstree', () =>
      runTask(this, () => this.callAction('eventDidLoad'), 1)
    );

    /*
      Event: ready.jstree
      Action: eventDidBecomeReady
      triggered after all nodes are finished loading
    */
    treeObject.on('ready.jstree', () => {
      runTask(
        this,
        () => {
          this.isReady = true;
          this.callAction('eventDidBecomeReady');
        },
        1
      );
    });

    /*
      Event: redraw.jstree
      Action: eventDidRedraw
      triggered after nodes are redrawn
    */
    treeObject.on('redraw.jstree', () =>
      runTask(this, () => this.callAction('eventDidRedraw'), 1)
    );

    /*
      Event: after_open.jstree
      Action: eventDidOpen
      triggered when a node is opened and the animation is complete
    */
    treeObject.on('after_open.jstree', (event, data) =>
      runTask(this, () => this.callAction('eventDidOpen', data.node), 1)
    );

    /*
      Event: after_close.jstree
      Action: eventDidClose
      triggered when a node is closed and the animation is complete
    */
    treeObject.on('after_close.jstree', (event, data) =>
      runTask(this, () => this.callAction('eventDidClose', data.node), 1)
    );

    /*
      Event: select_node.jstree
      Action: eventDidSelectNode
      triggered when a node is selected
    */
    treeObject.on('select_node.jstree', (event, data) => {
      runTask(
        this,
        () =>
          this.callAction(
            'eventDidSelectNode',
            data.node,
            data.selected,
            data.event
          ),
        1
      );
    });

    /*
      Event: deselect_node.jstree
      Action: eventDidDeselectNode
      triggered when an node is deselected
    */
    treeObject.on('deselect_node.jstree', (event, data) => {
      runTask(
        this,
        () =>
          this.callAction(
            'eventDidDeselectNode',
            data.node,
            data.selected,
            data.event
          ),
        1
      );
    });

    /*
      Event: changed.jstree
      Action: jstreeDidChange
      triggered when selection changes
    */
    treeObject.on('changed.jstree', (event, data) => {
      runTask(
        this,
        () => {
          // Check if selection changed
          if (isPresent(this.treeObject)) {
            const selectionChangedEventNames = [
              'model',
              'select_node',
              'deselect_node',
              'select_all',
              'deselect_all',
            ];
            if (
              isPresent(data.action) &&
              selectionChangedEventNames.includes(data.action)
            ) {
              this.selectedNodes = A(
                this.treeObject.jstree(true).get_selected(true)
              );
            }
          }

          this.callAction('eventDidChange', data);
        },
        1
      );
    });

    /*
      Event: hover_node.jstree
      Action: eventDidHoverNode
      triggered when a node is hovered
    */
    treeObject.on('hover_node.jstree', (event, data) =>
      runTask(this, () => this.callAction('eventDidHoverNode', data.node), 1)
    );

    /*
      Event: dehover_node.jstree
      Action: eventDidDehoverNode
      triggered when a node is no longer hovered
    */
    treeObject.on('dehover_node.jstree', (event, data) =>
      runTask(this, () => this.callAction('eventDidDehoverNode', data.node), 1)
    );

    /*
      Event: show_node.jstree
      Action: eventDidShowNode
      triggered when a node is no longer hovered
    */
    treeObject.on('show_node.jstree', (event, data) =>
      runTask(this, () => this.callAction('eventDidShowNode', data.node), 1)
    );

    /*
      Event: move_node.jstree
      Action: eventDidMoveNode
      triggered when a node is moved
    */
    treeObject.on('move_node.jstree', (event, data) =>
      runTask(this, () => this.callAction('eventDidMoveNode', data), 1)
    );

    const pluginsArray = this.plugins;
    if (isPresent(pluginsArray) && pluginsArray.includes('search')) {
      /*
        Event: search.jstree
        Action: eventDidSearch
        triggered when a search action is performed
      */
      treeObject.on('search.jstree', (event, data) =>
        runTask(this, () => this.callAction('eventDidSearch', event, data), 1)
      );
    }

    if (isPresent(pluginsArray) && pluginsArray.includes('checkbox')) {
      /*
       Event: disable_checkbox.jstree
       Action: eventDidDisableCheckbox
       triggered when an node's checkbox is disabled
     */
      treeObject.on('disable_checkbox.jstree', (event, data) =>
        runTask(
          this,
          () => this.callAction('eventDidDisableCheckbox', data.node),
          1
        )
      );

      /*
       Event: enable_checkbox.jstree
       Action: eventDidEnableCheckbox
       triggered when an node's checkbox is enabled
     */
      treeObject.on('enable_checkbox.jstree', (event, data) =>
        runTask(
          this,
          () => this.callAction('eventDidEnableCheckbox', data.node),
          1
        )
      );

      if (this.checkboxOptions && !this.checkboxOptions.tie_selected) {
        /*
         Event: check_node.jstree
         Action: eventDidCheckNode
         triggered when an node is checked (only if tie_selection in checkbox settings is false)
       */
        treeObject.on('check_node.jstree', (event, data) =>
          runTask(
            this,
            () =>
              this.callAction(
                'eventDidCheckNode',
                data.node,
                data.selected,
                data.event
              ),
            1
          )
        );

        /*
         Event: uncheck_node.jstree
         Action: eventDidUncheckNode
         triggered when an node is unchecked (only if tie_selection in checkbox settings is false)
       */
        treeObject.on('uncheck_node.jstree', (event, data) =>
          runTask(
            this,
            () =>
              this.callAction(
                'eventDidUncheckNode',
                data.node,
                data.selected,
                data.event
              ),
            1
          )
        );

        /*
         Event: check_all.jstree
         Action: eventDidCheckAll
         triggered when all nodes are checked (only if tie_selection in checkbox settings is false)
       */
        treeObject.on('check_all.jstree', (event, data) =>
          runTask(
            this,
            () => this.callAction('eventDidCheckAll', data.selected),
            1
          )
        );

        /*
         Event: uncheck_all.jstree
         Action: eventDidUncheckAll
         triggered when all nodes are unchecked (only if tie_selection in checkbox settings is false)
       */
        treeObject.on('uncheck_all.jstree', (event, data) =>
          runTask(
            this,
            () =>
              this.callAction('eventDidUncheckAll', data.node, data.selected),
            1
          )
        );
      }
    }
  }

  /**
   * Refreshes the data in the tree
   * TODO: Investigate why redraw(true) doesn't work...
   *
   * @method _redrawTree
   */
  @action
  _refreshTree() {
    let tree = this.getTree();
    if (null !== tree && false !== tree) {
      tree.settings.core.data = this.data;
      tree.refresh(this.skipLoading, this.forgetState);
    } else {
      // setup again if destroyed
      let treeObject = this._setupJsTree();
      this._setupEventHandlers(treeObject);
      this.treeObject = treeObject;
    }
  }

  getTree() {
    let tree = this.treeObject;
    return tree.jstree(true);
  }

  callAction(actionName, ...args) {
    if (actionName === 'destroy') {
      actionName = 'handleDestroy';
    }

    let action = this[actionName] || this.args[actionName];
    if (typeOf(action) === 'function') {
      return action(...args);
    }
  }

  _jsTreeFindNodeMatches(property, values) {
    let treeObject = this.treeObject;
    let nodes = [];

    if ('id' === property) {
      // If property is ID, can use get_node, which is faster than search.
      if (isArray(values)) {
        for (let i = 0; i < values.length; i++) {
          let node = treeObject.jstree(true).get_node(values[i]);
          nodes.push(node);
        }
      }
    } else {
      if (!isArray(values)) {
        values = A([values]);
      }

      let data = treeObject.jstree(true)._model.data;
      let dataKeys = Object.keys(data);

      for (let i = 0; i < values.length; i++) {
        let value = values[i];
        if (!isNone(value)) {
          for (let j = 0; j < dataKeys.length; j++) {
            let node = data[dataKeys[j]];
            if (
              typeOf(node.original) !== 'undefined' &&
              node.original[property] === value
            ) {
              nodes.push(node);
              break;
            }
          }
        }
      }
    }

    return nodes;
  }

  @action
  contextmenuItemDidClick(actionName, data) {
    let emberTreeObj = this.getTree;

    let instance = jQuery.jstree.reference(data.reference);
    let node = instance.get_node(data.reference);

    this.callAction(actionName, node, emberTreeObj);
  }

  @action
  redraw() {
    // Redraw true currently does not work as intended. Need to investigate.
    this._refreshTree();
  }

  @action
  handleDestroy() {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      if (!this.isTesting && !this._isDestroying) {
        treeObject.jstree(true).destroy();
      }

      this.callAction('eventDidDestroy');
    }
  }

  @action
  getNode(nodeId) {
    if (typeOf(nodeId) !== 'string') {
      throw new Error(
        'getNode() requires a node ID to be passed to it to return the node!'
      );
    }

    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionGetNode',
        treeObject.jstree(true).get_node(nodeId)
      );
    }
  }

  @action
  getText(obj) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction('actionGetText', treeObject.jstree(true).get_text(obj));
    }
  }

  @action
  getPath(obj, glue, ids) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionGetPath',
        treeObject.jstree(true).get_path(obj, glue, ids)
      );
    }
  }

  @action
  getChildrenDom(obj) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionGetChildrenDom',
        treeObject.jstree(true).get_children_dom(obj)
      );
    }
  }

  @action
  getContainer() {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionGetContainer',
        treeObject.jstree(true).get_container()
      );
    }
  }

  @action
  getParent(obj) {
    obj = obj || '#';
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionGetParent',
        treeObject.jstree(true).get_parent(obj)
      );
    }
  }

  @action
  loadNode(obj, cb) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionLoadNode',
        treeObject.jstree(true).load_node(obj, cb)
      );
    }
  }

  @action
  loadAll(obj, cb) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionLoadAll',
        treeObject.jstree(true).load_all(obj, cb)
      );
    }
  }

  @action
  openNode(obj, cb, animation) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).open_node(obj, cb, animation);
    }
  }

  @action
  openAll(obj, animation) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).open_all(obj, animation);
    }
  }

  @action
  closeNode(obj, cb) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).close_node(obj, cb);
    }
  }

  @action
  closeAll(obj, animation) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).close_all(obj, animation);
    }
  }

  @action
  toggleNode(obj) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).toggle_node(obj);
    }
  }

  @action
  createNode(obj, node, pos, callback, is_loaded) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionCreateNode',
        treeObject.jstree(true).create_node(obj, node, pos, callback, is_loaded)
      );
    }
  }

  @action
  renameNode(obj, val) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionRenameNode',
        treeObject.jstree(true).rename_node(obj, val)
      );
    }
  }

  @action
  moveNode(obj, par, pos, callback, is_loaded) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).move_node(obj, par, pos, callback, is_loaded);
    }
  }

  @action
  copyNode(obj, par, pos, callback, is_loaded) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).copy_node(obj, par, pos, callback, is_loaded);
    }
  }

  @action
  deleteNode(obj) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      this.callAction(
        'actionDeleteNode',
        treeObject.jstree(true).delete_node(obj)
      );
    }
  }

  @action
  selectNode(obj, suppress_event) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).select_node(obj, suppress_event);
    }
  }

  @action
  deselectNode(obj, suppress_event) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).deselect_node(obj, suppress_event);
    }
  }

  @action
  selectAll(suppress_event) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).select_all(suppress_event);
    }
  }

  @action
  deselectAll(suppress_event) {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      treeObject.jstree(true).deselect_all(suppress_event);
    }
  }

  @action
  lastError() {
    let treeObject = this.treeObject;
    if (!isNone(treeObject)) {
      let e = treeObject.jstree(true).last_error();
      this._lastError = e;
      this.callAction('actionLastError', e);
    }
  }

  @action
  deselectNodes(property, values) {
    if (arguments.length === 0) {
      warn(
        'Using deselectNodes without parameters to deselect all nodes is deprecated. Use the deselectAll action to deselect all nodes.'
      );
      this.deselectAll();
      return;
    }

    let treeObject = this.treeObject;
    let nodes = this._jsTreeFindNodeMatches(property, values);

    treeObject.jstree(true).deselect_node(nodes, true, true);
    treeObject.jstree(true).redraw(); // Redraw so that parent nodes get their indicator changed.
  }

  @action
  selectNodes(property, values) {
    let treeObject = this.treeObject;
    if (null !== treeObject && !this.isDestroyed && !this.isDestroying) {
      let nodes = this._jsTreeFindNodeMatches(property, values);
      treeObject.jstree(true).select_node(nodes, true, true);
    }
  }

  @action
  send(actionName, ...args) {
    this.callAction(actionName, ...args);
  }
}
