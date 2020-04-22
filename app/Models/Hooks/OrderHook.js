'use strict'

const OrderHook = exports = module.exports = {}

OrderHook.updateValues = async (model) => {
    /** Quando usa o $sideLoaded é para apenas retornar o valor para a query, sem salvar no banco de dados, se usar apenas model.campo vai tentar salvar no banco de dados no campo que foi passado */
    model.$sideLoaded.subtotal = await model.items().getSum('subtotal')
    model.$sideLoaded.qty_items = await model.items().getSum('quantity')
    model.$sideLoaded.discount = await model.discounts().getSum('discount')
    model.total = model.$sideLoaded.subtotal - model.$sideLoaded.discount
}


OrderHook.updateCollectionValues = async (models) => {
    for (const model of models) {
        model = await OrderHook.updateValues(model)
    }
}