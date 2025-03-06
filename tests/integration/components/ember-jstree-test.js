import { render, find, click } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import jQuery from 'jquery';
import { module, test } from 'qunit';

module('Integration | Component | ember-jstree', function (hooks) {
  setupRenderingTest(hooks);

  test('events#eventDidOpen', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidOpen(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidOpen={{this.eventDidOpen}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('after_open.jstree', data);
  });

  test('events#eventDidClose', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidClose(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidClose={{this.eventDidClose}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('after_close.jstree', data);
  });

  test('events#eventDidChange', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidChange(e) {
        assert.equal(e, data);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidChange={{this.eventDidChange}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('changed.jstree', data);
  });

  test('events#eventDidDehoverNode', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidDehoverNode(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidDehoverNode={{this.eventDidDehoverNode}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('dehover_node.jstree', data);
  });

  test('events#eventDidDeselectNode', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidDeselectNode(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidDeselectNode={{this.eventDidDeselectNode}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('deselect_node.jstree', data);
  });

  test('events#eventDidHoverNode', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidHoverNode(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidHoverNode={{this.eventDidHoverNode}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('hover_node.jstree', data);
  });

  test('events#eventDidInit', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidInit() {
        assert.notOk(arguments.length);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidInit={{this.eventDidInit}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('init.jstree', data);
  });

  test('events#eventIsLoading', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventIsLoading() {
        assert.notOk(arguments.length);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventIsLoading={{this.eventIsLoading}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('loading.jstree', data);
  });

  test('events#eventDidLoad', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidLoad() {
        assert.notOk(arguments.length);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidLoad={{this.eventDidLoad}}
      />
    `);
  });

  test('events#eventDidBecomeReady', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidBecomeReady() {
        assert.notOk(arguments.length);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidBecomeReady={{this.eventDidBecomeReady}}
      />
    `);
  });

  test('events#eventDidRedraw', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidRedraw() {
        assert.notOk(arguments.length);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidRedraw={{this.eventDidRedraw}}
      />
    `);
  });

  test('events#eventDidShowNode', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidShowNode(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidShowNode={{this.eventDidShowNode}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('show_node.jstree', data);
  });

  test('events#eventDidSelectNode', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidSelectNode(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidSelectNode={{this.eventDidSelectNode}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('select_node.jstree', data);
  });

  test('events#eventDidDestroy', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidDestroy() {
        assert.notOk(arguments.length);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidDestroy={{this.eventDidDestroy}}
      />
    `);
  });

  test('events#eventDidMoveNode', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidMoveNode(e) {
        assert.equal(e, data);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @eventDidMoveNode={{this.eventDidMoveNode}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('move_node.jstree', data);
  });

  test('events#eventDidDisableCheckbox', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidDisableCheckbox(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @plugins='checkbox'
        @eventDidDisableCheckbox={{this.eventDidDisableCheckbox}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('disable_checkbox.jstree', data);
  });

  test('events#eventDidEnableCheckbox', async function (assert) {
    assert.expect(1);
    const data = { node: {} };
    this.setProperties({
      data,
      eventDidEnableCheckbox(e) {
        assert.equal(e, data.node);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @plugins='checkbox'
        @eventDidEnableCheckbox={{this.eventDidEnableCheckbox}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('enable_checkbox.jstree', data);
  });

  test('events#eventDidCheckNode', async function (assert) {
    assert.expect(3);
    const data = {
      node: {},
      selected: {},
      event: {},
    };
    this.setProperties({
      data,
      checkboxOptions: { tie_selection: false },
      eventDidCheckNode(node, selected, event) {
        assert.ok(node);
        assert.strictEqual(selected[0], node.id);
        assert.strictEqual(event.type, 'click');
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @plugins='checkbox'
        @checkboxOptions={{this.checkboxOptions}}
        @eventDidCheckNode={{this.eventDidCheckNode}}
      />
    `);

    await click('.jstree-last .jstree-anchor');
  });

  test('events#eventDidUncheckNode', async function (assert) {
    assert.expect(3);
    const data = {
      node: { id: '#' },
      selected: {},
      event: {},
    };
    this.setProperties({
      data,
      checkboxOptions: { tie_selection: false },
      eventDidUncheckNode(node, selected, event) {
        assert.ok(node);
        assert.strictEqual(selected.length, 0);
        assert.strictEqual(event.type, 'click');
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @plugins='checkbox'
        @checkboxOptions={{this.checkboxOptions}}
        @eventDidUncheckNode={{this.eventDidUncheckNode}}
      />
    `);

    await click('.jstree-last .jstree-anchor');
    await click('.jstree-last .jstree-anchor');
  });

  test('events#eventDidCheckAll', async function (assert) {
    assert.expect(1);
    const data = { selected: {} };
    this.setProperties({
      data,
      checkboxOptions: { tie_selection: false },
      eventDidCheckAll(e) {
        assert.equal(e, data.selected);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @plugins='checkbox'
        @checkboxOptions={{this.checkboxOptions}}
        @eventDidCheckAll={{this.eventDidCheckAll}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('check_all.jstree', data);
  });

  test('events#eventDidUncheckAll', async function (assert) {
    assert.expect(2);
    const data = { node: {}, selected: {} };
    this.setProperties({
      data,
      checkboxOptions: { tie_selection: false },
      eventDidUncheckAll(node, selected) {
        assert.equal(node, data.node);
        assert.equal(selected, data.selected);
      },
    });

    await render(hbs`
      <EmberJstree
        @data={{this.data}}
        @plugins='checkbox'
        @checkboxOptions={{this.checkboxOptions}}
        @eventDidUncheckAll={{this.eventDidUncheckAll}}
      />
    `);

    jQuery.jstree.reference('.jstree').trigger('uncheck_all.jstree', data);
  });
});
