import { ValueObject } from "~/shared";

interface OrderMetaProps {
  addToCommunity: string;
  knowledgeFrom: string;
  crossfitBox: string;
}

export class OrderMetaValueObject extends ValueObject<OrderMetaProps> {
  private constructor(props: OrderMetaProps) {
    super(props);
  }

  static create(props: OrderMetaProps) {
    return new OrderMetaValueObject(props);
  }
}
