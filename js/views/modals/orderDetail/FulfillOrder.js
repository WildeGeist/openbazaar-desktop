import {
  fulfillingOrder,
  fulfillOrder,
  events as orderEvents,
} from '../../../utils/order';
import loadTemplate from '../../../utils/loadTemplate';
import BaseVw from '../../baseVw';

export default class extends BaseVw {
  constructor(options = {}) {
    super(options);

    if (!this.model) {
      throw new Error('Please provide an OrderFulfillment model.');
    }

    if (!options.contractType) {
      throw new Error('Please provide the contract type.');
    }

    this.contractType = options.contractType;
    this.listenTo(orderEvents, 'fulfillingOrder', this.onFulfillingOrder);
    this.listenTo(orderEvents, 'fulfillOrderComplete, fulfillOrderFail',
      this.onFulfillOrderAlways);
  }

  className() {
    return 'fulfillOrderTab';
  }

  events() {
    return {
      'click .js-backToSummary': 'onClickBackToSummary',
      'click .js-cancel': 'onClickCancel',
      'click .js-submit': 'onClickSubmit',
    };
  }

  onClickBackToSummary() {
    this.trigger('clickBackToSummary');
  }

  onClickCancel() {
    const id = this.model.id;
    this.model.reset();
    // restore the id reset blew away
    this.model.set({ orderId: id });
    this.render();
    this.trigger('clickCancel');
  }

  onClickSubmit() {
    const formData = this.getFormData();
    this.model.set(formData);
    this.model.set({}, { validate: true });

    if (!this.model.validationError) {
      fulfillOrder(this.model.id, this.model.toJSON());
    }

    this.render();
    const $firstErr = this.$('.errorList:first');
    if ($firstErr.length) $firstErr[0].scrollIntoViewIfNeeded();
  }

  onFulfillingOrder(e) {
    if (e.id === this.model.id) {
      this.$btnSubmit.addClass('processing');
      this.$btnCancel.addClass('disabled');
    }
  }

  onFulfillOrderAlways(e) {
    if (e.id === this.model.id) {
      this.$btnSubmit.removeClass('processing');
      this.$btnCancel.removeClass('disabled');
    }
  }

  get $btnCancel() {
    return this._$btnCancel ||
      (this._$btnCancel = this.$('.js-cancel'));
  }

  get $btnSubmit() {
    return this._$btnSubmit ||
      (this._$btnSubmit = this.$('.js-submit'));
  }

  render() {
    loadTemplate('modals/orderDetail/fulfillOrder.html', (t) => {
      this.$el.html(t({
        contractType: this.contractType,
        ...this.model.toJSON(),
        errors: this.model.validationError || {},
        fulfillingOrder: fulfillingOrder(this.model.id),
      }));

      this._$btnCancel = null;
      this._$btnSubmit = null;
    });

    return this;
  }
}
