import React, { useEffect, useState } from 'react'
import OrderCard from '../../components/OrderCard'
import { getOrders } from '../../controllers/adminController'
import { useLocation } from 'react-router-dom';
import Pagination from "../../components/Pagination";


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Orders = () => {
    const query = useQuery()
    const page = query.get('page') || 1

    const [totalPages, setTotalPages] = useState(1);
    const [orders, setOrders] = useState([])

    useEffect(() => {
        const getData = async () => {
            const res = await getOrders({ page, limit: 10 })
            setOrders(res.orders)
            setTotalPages(res.totalPages)
        }
        getData()
    }, [page,orders])
    return (
        <div>
            <h3>Orders page</h3>
            <div>
                {orders && orders.map((o, i) => (<OrderCard props={o} key={i} setOrders={setOrders} orders={orders} />))}
            </div>
            {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} link="/admin/orders" />
            }
        </div>
    )
}

export default Orders