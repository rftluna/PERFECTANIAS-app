import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { ProductFormUI } from "./ProductFormUI";
import { validateProduct } from "../../../utils/validateProduct";
import { uploadImage } from "../../../services/uploadImage";
import { createProduct } from "../../../services/productsService";
import "./ProductFormContainer.css";

/*------------------------------------------------------------------------------*/
/*----------          EDITAR el utils/validateProduct.js              -------------*/
/*------------------------------------------------------------------------------*/

// En el caso de utilizar este formulario con doble uso (carga y edicion) el archivo que valida las entradas
// del producto deberia evaluar el caso de la imagen existente.
// Evalua file, para la carga de foto nueva y product.image cuando viene de DB

export const ProductFormContainer = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Capturamos el ID de la URL si estamos editando

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [product, setProduct] = useState({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "" // Agregamos image por si viene de la base de datos al editar
    });

    // Si hay un ID, es porque es para editar. Buscamos el producto en Firestore para rellenar el formulario (Modo Edición)
    useEffect(() => {
        if (id) {
            const fetchProductToEdit = async () => {
                try {
                    setLoading(true);
                    // CORREGIDO: Apuntamos a la colección correcta "turnos de servicios"
                    const docRef = doc(db, "turnos de servicios", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProduct(docSnap.data());
                    } else {
                        console.error("El producto no existe");
                    }
                } catch (error) {
                    console.error("Error al obtener el producto para editar: ", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProductToEdit();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0] || null;
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        // Validar inputs
        const newErrors = validateProduct({ ...product, file });
        if (Object.keys(newErrors).length > 0 && !id) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            let imageUrl = product.image;

            // Si el usuario seleccionó una nueva imagen al editar o crear, la subimos
            if (file) {
                imageUrl = await uploadImage(file); //subir la imagen, con el retorno de imgBB (nueva URL)
            }

            // armar el producto completo
            const productData = {
                ...product,
                price: Number(product.price),
                image: imageUrl
            };

            if (id) {
                // MODO EDICIÓN: Actualizamos el documento existente en la colección correcta
                const docRef = doc(db, "turnos de servicios", id);
                await updateDoc(docRef, productData);
                alert("¡Producto actualizado con éxito!");
                navigate("/admin/products", { replace: true });
            } else {
                // MODO CREACIÓN: Alta de un producto nuevo
                const newId = await createProduct(productData);
                // vaciar
                setProduct({ name: "", price: "", category: "", description: "", image: "" });
                setFile(null);
                navigate(`/admin/products/success/${newId}`, { replace: true });
            }
        } catch (error) {
            setErrors({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProductFormUI
            product={product}
            errors={errors}
            loading={loading}
            isEditing={Boolean(id)} // Indicador útil por si se quiere cambiar el título en la UI
            onChange={handleChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
        />
    );
};
