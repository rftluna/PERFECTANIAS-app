import { useCart } from "../../context/CartContext";
import { Item } from "../Item/Item";

const formatPrice = (price) => {
    const value =
        typeof price === "number"
            ? price
            : Number(
                  String(price ?? "")
                      .replace(/[^\d,.-]/g, "")
                      .replace(/\./g, "")
                      .replace(",", ".")
              );

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);
};

export const CartItem = ({ item }) => {
    const { removeItem } = useCart();

    const quantity = Number(item.quantity) || 1;
    const price =
        typeof item.price === "number"
            ? item.price
            : Number(
                  String(item.price ?? "")
                      .replace(/[^\d,.-]/g, "")
                      .replace(/\./g, "")
                      .replace(",", ".")
              ) || 0;

    const subtotal = price * quantity;

    return (
        <Item {...item}>
            <div className="cart-item-details">
                <p>
                    <strong>Cantidad:</strong> {quantity}{" "}
                    {quantity === 1 ? "unidad" : "unidades"}
                </p>

                <p>
                    <strong>Subtotal: AR</strong> {formatPrice(subtotal)}
                </p>

                <button
                    className="btn bg-delete primary"
                    onClick={() => removeItem(item.id)}
                >
                    Eliminar item
                </button>
            </div>
        </Item>
    );
};
