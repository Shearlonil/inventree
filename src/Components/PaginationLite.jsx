import { Pagination } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function PaginationLite(props) {
    /*  itemCount is the total number of items to be displayed in the table
        pageSize is the number of items per page to display
        neighbour is the number of pagination items to be added before and after the current/selected pagination item
        pageChanged is a supplied callback func from PaginationLite to get data to show on current selected page
    */

    const { itemCount, pageSize, pageNumber = 1, setPageChanged } = props;
    const pageCount = Math.ceil(itemCount / pageSize);
    const neighbour = 2, range = [];
    const [currentPage, setCurrentPage] = useState(1);

    const getPageNumber = (pageNumber) => {
        setCurrentPage(pageNumber);
        setPageChanged(pageNumber);
    };

    useEffect(() => {
        //  set current page back to 1 as the table will be re-rendered and back to first page
        setCurrentPage(pageNumber);
        getPageNumber(pageNumber);
    }, [itemCount, pageNumber]);

    if (pageCount <= 1) return null;

    let paginationItems = [];

    for (
        let i = Math.max(2, currentPage - neighbour);
        i <= Math.min(pageCount - 1, currentPage + neighbour);
        i++
    ) {
        range.push(i);
    }

    if (currentPage - neighbour > 2) {
        range.unshift("...");
    }

    if (currentPage + neighbour < pageCount - 1) {
        range.push("...");
    }

    range.unshift(1);
    if (pageCount !== 1) {
        range.push(pageCount);
    }

    range.map((pageNumber, index) => {
        !isNaN(pageNumber)
            ? paginationItems.push(
                <Pagination.Item
                    key={index}
                    active={pageNumber === currentPage}
                    onClick={() => getPageNumber(pageNumber)}
                >
                {pageNumber}
                </Pagination.Item>
            )
          : paginationItems.push(<Pagination.Ellipsis key={index} />);
    });

    return <Pagination>{paginationItems}</Pagination>;
}
