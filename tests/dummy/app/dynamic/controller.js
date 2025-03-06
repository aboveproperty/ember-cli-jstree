import Controller from '@ember/controller';
import { action } from '@ember/object';
import { A } from '@ember/array';
import ENV from 'dummy/config/environment';
import { tracked } from '@glimmer/tracking';

export default class DynamicController extends Controller {
  @tracked jstreeActionReceiver = null;
  @tracked jstreeSelectedNodes = A();

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
    return {
      url(node) {
        if (ENV.environment === 'production') {
          return node.id === '#'
            ? '/ember-cli-jstree/ajax_data_roots.json'
            : '/ember-cli-jstree/ajax_data_children.json';
        } else {
          return node.id === '#'
            ? '/ajax_data_roots.json'
            : '/ajax_data_children.json';
        }
      },
      data(node) {
        return { id: node.id };
      },
    };
  }

  @tracked lastItemClicked = '';
  @tracked treeReady = false;

  get plugins() {
    return 'wholerow, dnd';
  }

  get themes() {
    return {
      name: 'default',
      responsive: true,
    };
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
  handleTreeSelectionDidChange() {
    this.jstreeActionReceiver.send('getSelected');
  }

  @action
  contextMenuReportClicked(node) {
    this.lastItemClicked =
      '"Report" item for node: <' + node.text + '> was clicked.';
  }

  @action
  handleTreeDidBecomeReady() {
    this.treeReady = true;
  }

  @action
  handleJstreeEventDidMoveNode(node) {
    console.log(node); // eslint-disable-line no-console
  }

  @action
  updateField(field, value) {
    this[field] = value;
  }
}
