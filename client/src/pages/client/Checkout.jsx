import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { Navigate, useNavigate } from "react-router-dom";
import { newOrder } from "../../controllers/userController";
import { showErrorAlert } from '../../assets/ErrorHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { shippingArray } from '../../assets/shipping'

const Checkout = () => {

    const { cart, dispatch } = useCart();
    const [wilayas, setWilayas] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [filteredCommunes, setFilteredCommunes] = useState([]);

    const [total, setTotal] = useState();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [mnplct, setMnplct] = useState("");
    const [state, setState] = useState("");
    const [shippingPrice, setShippingPrice] = useState(0)

    const [freeShipping, setFreeShipping] = useState(true);


    const navigate = useNavigate()

    document.title = `Checkout`

    const handleOrderPlacement = async (e) => {
        e.preventDefault()
        setState(prev => parseInt(prev))
        try {
            if (!firstName || !lastName || !street || !state || !mnplct || !phone) {
                throw Error("All Fields are required")
            }
            const res = await newOrder({
                totalPrice: total + (!freeShipping && shippingPrice), cart, billingInfo: {
                    firstName, lastName,
                    street, state, mnplct, phone
                }
            })
            dispatch({
                type: 'CLEAR_CART',
            });
            navigate('/success')
        } catch (error) {
            showErrorAlert(error.message)
        }
    }


    const handleWilayaChange = (event) => {
        const wilayaId = event.target.value;
        console.log(wilayaId);
        const obj = shippingArray.find(item => (item.id == wilayaId))
        setShippingPrice(obj.price)
        const filtered = communes.filter(commune => commune.wilaya_code === wilayaId);
        setFilteredCommunes(filtered);
    };

    useEffect(() => {
        const getData = async () => {
            const res = await fetch('/communes.json')
            const data = await res.json()
           const wilayas = data.reduce((group, item) => {
                const { wilaya_code } = item;
                if (!group[wilaya_code]) {
                    group[wilaya_code] = []; // Initialize the category if it doesn't exist
                }
                group[wilaya_code].push(item);
                return group;
            }, {})            
            
            setWilayas(wilayas);
            setCommunes(data);
        }
        getData()
    }, [])

    useEffect(() => {

        const isPaidShipping = cart.some(item => item.freeShipping === false);
        console.log(isPaidShipping);
        

        if (isPaidShipping) setFreeShipping(false)

        setTotal(cart.reduce((sum, product) =>
            (sum + (product.price * product.quantity)), 0))
    }, [cart, communes]);

    if (cart.length === 0) return <Navigate to="/collections" />
    return (
        <form className="flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t">
            <ToastContainer />
            <div className="flex flex-col gap-4 w-full sm:max-w-[480px] font-['Cairo'] ">
                <div className="text-xl sm:text-2xl my-3 text-right">
                    <div className="flex flex-row-reverse gap-2 items-center mb-3 ">
                        <p className="text-gray-500">معلومات <span className="text-gray-700 font-medium">التوصيل</span>
                        </p>
                        <p className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700"></p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input required name="firstName" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="الاسم"
                        value={firstName} onChange={(e) => { setFirstName(e.target.value) }} />
                    <input required name="lastName" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="اللقب"
                        value={lastName} onChange={(e) => { setLastName(e.target.value) }} />
                </div>
                <input required="" name="phone" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="رقم الهاتف"
                    min={0} value={phone} onChange={(e) => { setPhone(e.target.value) }} />
                <input required="" name="street" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="الحي"
                    value={street} onChange={(e) => { setStreet(e.target.value) }} />
                <div className="flex gap-3">
                    <select required className='p-2 bg-white shadow-sm border-[1.5px] rounded-md flex-1 text-left'
                        value={state} onChange={(e) => {
                            handleWilayaChange(e)
                            setState(e.target.value)
                        }}>
                        <option value="">الولاية</option>
                        {Object.values(wilayas).map((wilaya, index) => (
                            <option key={index} value={index + 1}>
                                {wilaya[0].wilaya_name_ascii}
                            </option>
                        ))}
                    </select>
                    <select required
                        value={mnplct} onChange={(e) => { setMnplct(e.target.value) }}
                        className='p-2 bg-white shadow-sm border-[1.5px] rounded-md flex-1 text-left'>
                        <option value="">البلدية</option>
                        {filteredCommunes.map(commune => (
                            <option key={commune.id} value={commune.commune_name_ascii} >
                                {commune.commune_name_ascii}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
            <div className="w-full mt-8">
                <div className="mt-8 min-w-80">
                    <div className="w-full">
                        <div className="text-2xl text-right font-['Cairo']">
                            <div className="flex flex-row-reverse gap-2 items-center mb-3 ">
                                <p className="text-gray-500">مجاميع <span className="text-gray-700 font-medium">السلة</span></p>
                                <p className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700"></p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-2 text-sm font-['Cairo']">
                            <div className="flex justify-between flex-row-reverse">
                                <p>المجموع الفرعي</p><p>DA {total}.00</p></div><hr />
                            <div className="flex justify-between flex-row-reverse">
                                <p>رسوم الشحن</p><p>DA {freeShipping ? "0.00" : `${shippingPrice}.00`}</p></div><hr />
                            <div className="flex justify-between flex-row-reverse">
                                <b>المجموع</b><b>DA {total + (!freeShipping && shippingPrice)}.00</b>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 text-end">
                    <div className="inline-flex flex-row-reverse gap-2 items-center mb-3 font-['Cairo']">
                        <p className="text-gray-500">طريقة <span className="text-gray-700 font-medium">الدفع</span></p>
                        <p className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700"></p>
                    </div>
                    <div className="flex justify-end gap-3 flex-col lg:flex-row">
                        <div className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                            <p className="min-w-3.5 h-3.5 border rounded-full bg-green-400"></p>
                            <p className="text-gray-500 text-sm font-medium mx-4 font-['Cairo']">الدفع عند التسليم</p>
                        </div>
                        {/*  <div className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                            <p className="min-w-3.5 h-3.5 border rounded-full bg-orange-400"></p>
                            <p className="text-gray-500 text-sm font-medium mx-4 ">EDDAHABIYA (SOON)</p>
                        </div> */}
                    </div>
                    <div className="w-full text-start mt-8 font-['Cairo'] font-semibold">
                        <button type="submit" className="bg-black text-white px-16 py-3 text-sm"
                            onClick={handleOrderPlacement}>تاكيد الطلب</button>
                    </div>
                </div>
            </div>
        </form>)
}

export default Checkout
