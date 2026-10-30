import { useCart } from "../../context/CartContext";

export const CartSummary = () => {
  const { getCartTotal, checkout } = useCart();

  const total = getCartTotal();

  return (
    <>
      <p>Subtotal: AR${total} </p>
      <button className="btn bg-success primary" onClick={checkout}>
      Continuar 
      </button>
    </>
  );
};
