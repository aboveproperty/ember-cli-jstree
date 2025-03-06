import Controller from '@ember/controller';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class StaticController extends Controller {
  @tracked jstreeActionReceiver = null;
  @tracked jstreeSelectedNodes = A();
  @tracked jstreeBuffer = null;
  @tracked searchTerm = '';

  @tracked _data = null;

  get sortedSelectedNodes() {
    return this.jstreeSelectedNodes.sort((a, b) => {
      if (a.text > b.text) {
        return 1;
      } else if (a.text < b.text) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  get data() {
    if (this._data) {
      return this._data;
    }

    return [
      'Simple root node',
      {
        text: 'Single child node (has tooltip)',
        type: 'single-child',
        children: ['one child'],
        a_attr: {
          class: 'hint--top',
          'data-hint': 'Use a_attr to add tooltips',
        },
      },
      {
        id: 'rn2',
        text: 'Opened node (has tooltip)',
        state: {
          opened: true,
          selected: true,
        },
        a_attr: {
          class: 'hint--bottom',
          'data-hint': 'This is a bottom mounted node tooltip',
        },
        children: [
          {
            text: 'Child 1',
          },
          'Child 2',
        ],
      },
    ];
  }

  @tracked lastItemClicked = '';
  @tracked treeReady = false;

  get plugins() {
    return 'checkbox, wholerow, state, search, types, contextmenu';
  }

  get themes() {
    return {
      name: 'default',
      responsive: true,
    };
  }

  get checkboxOptions() {
    return { keep_selected_style: false };
  }
  get searchOptions() {
    return {
      show_only_matches: true,
    };
  }

  get stateOptions() {
    return {
      key: 'ember-cli-jstree-dummy',
    };
  }

  get typesOptions() {
    return {
      'single-child': {
        max_children: '1',
      },
    };
  }

  get contextmenuOptions() {
    return {
      show_at_node: false,
      items: {
        reportClicked: {
          label: 'Report Clicked',
          action: 'contextMenuReportClicked',
        },
      },
    };
  }

  get jsonifiedBuffer() {
    let b = this.jstreeBuffer;

    if (null !== b && b) {
      return JSON.stringify(b);
    } else {
      return '<No output>';
    }
  }

  @action
  redraw() {
    this.jstreeActionReceiver.send('redraw');
  }

  @action
  destroyTree() {
    this.jstreeActionReceiver.send('destroy');
  }

  @action
  getNode(nodeId) {
    this.jstreeActionReceiver.send('getNode', nodeId);
  }
  @action
  handleGetNode(node) {
    if (node) {
      this.jstreeBuffer = node;
    }
  }

  @action
  contextMenuReportClicked(node) {
    this.lastItemClicked =
      '"Report" item for node: <' + node.text + '> was clicked.';
  }
  @action
  addChildByText(nodeTextName) {
    if (typeof nodeTextName !== 'string') {
      return;
    }

    const data = this.data;
    data.forEach(function (node, index) {
      if (typeof node === 'object' && node.text === nodeTextName) {
        data[index].children.push('added child');
      }
    });
    this._data = data;
    this.redraw();
  }

  @action
  handleTreeDidBecomeReady() {
    this.treeReady = true;
  }

  @action
  updateField(field, value) {
    this[field] = value;
  }
}
