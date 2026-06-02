import { Accordion } from "react-bootstrap";
import SVG from "../assets/Svg";
import { faqs } from "../../data";

const Faq = () => {

	return (
		<div className="container" style={{minHeight: '70vh'}}>
            <div className="container mx-auto d-flex flex-column rounded-4 rounded-bottom-0 m-3 align-items-center" >
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "1px 1px 1px black"}}>Frequently Asked Questions</span>
						<img src={SVG.faq} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    If you can't find an answer that you're looking for, please feel free to give us a call, send a mail or chat with us.
                </span>
			</div>
			<div className="row mt-4 mx-auto d-flex flex-column m-3 align-items-center">
				<Accordion> 
					{faqs.map((faq, index) => (
						<Accordion.Item key={index} eventKey={String(index)} className="mb-3 border-0 rounded-custom overflow-hidden">
							<Accordion.Header>{faq.q}</Accordion.Header>
							<Accordion.Body className="text-muted-custom" style={{ fontSize: '0.92rem', lineHeight: 1.7 }}>
								{faq.a}
								{faq.list && <ul>
									{faq.list.map(li => <li key={li}> {li} </li>)}
								</ul>}
								{faq.note && faq.note}
							</Accordion.Body>
						</Accordion.Item>
					))}
				</Accordion>
			</div>
		</div>
	);
};

export default Faq;
