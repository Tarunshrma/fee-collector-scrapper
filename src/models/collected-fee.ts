import { getModelForClass, index,  prop } from "@typegoose/typegoose";
  
@index({ integrator: 1})
class CollectedFee {
    @prop({ required: true})
    token!: string

    @prop({ required: true})
    integrator!: string

    @prop({ required: true})
    integratorFee!: string

    @prop({ required: true})
    lifiFee!: string
}

export const CollectedFeeModel = getModelForClass(CollectedFee)