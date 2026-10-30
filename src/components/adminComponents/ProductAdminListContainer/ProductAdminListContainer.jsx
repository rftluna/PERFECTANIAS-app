import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { Link } from "react-router-dom";
import "./ProductAdminListContainer.css";

export const ProductAdminListContainer = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            // Apuntamos a la colección exacta que tienes en Firestore: "turnos de servicios"
            const querySnapshot = await getDocs(collection(db, "turnos de servicios"));
            const list = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(list);
        } catch (error) {
            console.error("Error al obtener productos: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                // Eliminamos el documento apuntando a la colección correcta
                await deleteDoc(doc(db, "turnos de servicios", id));
                setProducts(products.filter((prod) => prod.id !== id));
            } catch (error) {
                console.error("Error al eliminar el producto: ", error);
            }
        }
    };

    if (loading) {
        return <p className="admin-loading">Cargando productos. Espera unos instantes porfavor...</p>;
    }

    return (
        <div className="admin-products-container">
            <h2>Productos cargados ({products.length})</h2>
            <div className="admin-products-list">
                {products.map((product) => (
                    <div key={product.id} className="admin-product-card">
                        <div className="admin-product-info">
                            <img src={product.image || product.file} alt={product.name} className="admin-product-img" />
                            <div>
                                <h4>{product.name}</h4>
                                <p className="admin-product-category">{product.category}</p>
                                <p className="admin-product-price">${product.price}</p>
                            </div>
                        </div>

                        <div className="admin-product-actions">
                            <Link to={`/admin/products/edit/${product.id}`} className="btn-edit">
                                Editar
                            </Link>
                            <button onClick={() => handleDelete(product.id)} className="btn-delete">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};