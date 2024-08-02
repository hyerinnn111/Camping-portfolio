import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ReservationPayment.css";
import PaymentModal from "../UI/PaymentModal";
import "../UI/PaymentModal.css";
import { fetchProductDetails, fetchOptions } from "../service/ApiService";

export default function ReservationPayment() {
  const { productName } = useParams();
  const navigate = useNavigate(); // useNavigate 추가
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [peopleCount, setPeopleCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    closeModal();
    navigate("/payment-success"); // 결제 성공 후 리디렉션할 경로
  };

  useEffect(() => {
    setLoading(true);
    fetchProductDetails(productName)
      .then((data) => {
        if (data) {
          setProductDetails(data);
          setSelectedImage(data.mainImageUrl || "");
          setPeopleCount(1);
        } else {
          console.error("Product details are undefined");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        setLoading(false);
      });

    fetchOptions()
      .then((data) => {
        console.log("Fetched Options:", data);
        setOptions(data);
      })
      .catch((error) => {
        console.error("Error fetching Options:", error);
      });
  }, [productName]);

  const selectImage = (image) => {
    setSelectedImage(image);
  };

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" };
    return new Date(date).toLocaleDateString("ko-KR", options);
  };

  const handleOptionChange = (e) => {
    const optionName = e.target.value;
    if (optionName) {
      setSelectedOptions((prevOptions) => {
        const newOptions = { ...prevOptions };
        if (newOptions[optionName]) {
          newOptions[optionName].count += 1;
        } else {
          const option = options.find((option) => option.optionName === optionName);
          if (option) {
            newOptions[optionName] = {
              count: 1,
              price: option.optionPrice,
            };
          }
        }
        return newOptions;
      });
    }
  };

  const increaseCount = (optionName) => {
    setSelectedOptions((prevOptions) => {
      const newOptions = { ...prevOptions };
      if (newOptions[optionName]) {
        newOptions[optionName].count += 1;
      }
      return newOptions;
    });
  };

  const decreaseCount = (optionName) => {
    setSelectedOptions((prevOptions) => {
      const newOptions = { ...prevOptions };
      if (newOptions[optionName] && newOptions[optionName].count > 1) {
        newOptions[optionName].count -= 1;
      } else {
        delete newOptions[optionName];
      }
      return newOptions;
    });
  };

  const calculateNights = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const differenceInTime = end.getTime() - start.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      return differenceInDays;
    }
    return 0;
  };

  const nights = calculateNights();
  const productPrice = productDetails?.price || 0;
  const totalProductPrice = productPrice * nights;

  const totalPrice = Object.keys(selectedOptions).reduce((acc, optionName) => {
    const { count, price } = selectedOptions[optionName];
    return acc + count * price;
  }, totalProductPrice);
  

  const handlePeopleCountChange = (change) => {
    setPeopleCount((prevCount) => {
      const maxPeople = productDetails?.maxPeople || Infinity;
      const newCount = prevCount + change;
      return Math.min(Math.max(newCount, 1), maxPeople);
    });
  };

  if (loading) return <div>Loading...</div>;

  if (!productDetails) {
    return <div>Product details not available.</div>;
  }

  return (
    <>
      <div className="rp-body">
        <div className="rp-left-section">
          <div className="rp-image-section">
            <div className="rp-main-image">
              <img src={selectedImage} alt="Selected" />
            </div>
            <div className="rp-sub-images">
              <img src={`${productDetails.mainImageUrl}`} alt="Thumbnail 1" onClick={() => selectImage(productDetails.mainImageUrl)} />
              <img src={`${productDetails.subImageUrl}`} alt="Thumbnail 2" onClick={() => selectImage(productDetails.subImageUrl)} />
              <img src={`${productDetails.subImageUrl2}`} alt="Thumbnail 3" onClick={() => selectImage(productDetails.subImageUrl2)} />
              <img src={`${productDetails.subImageUrl3}`} alt="Thumbnail 4" onClick={() => selectImage(productDetails.subImageUrl3)} />
            </div>
          </div>
          <div className="rp-description-section">
            <div>
              <h4>객실 구성</h4>
              <ul>
                <li>
                  <p>야외테크 + 전용주차장</p>
                </li>
              </ul>
            </div>
            <div>
              <h4>기준 인원</h4>
              <ul>
                <li>
                  <p>최대 인원은 영유아 포함입니다</p>
                </li>
                <li>
                  <p>최대 인원 초과 시 예약이 불가합니다</p>
                </li>
              </ul>
            </div>
            <div>
              <h4>입실 시간</h4>
              <ul>
                <li>
                  <p>
                    체크인 <span>15:00</span>
                  </p>
                </li>
                <li>
                  <p>
                    체크아웃 <span>11:00</span>
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <h4>구비 시설</h4>
              <p>
                킹 사이즈 베드 1, 싱글베드 2, TV, 쇼파, 테이블, 블루투스 스피커, 커피포트, 냉장고
                <br />
                인덕션(1구), 전자레인지, 드라이어기, 욕실용품(샴푸&린스&바디워시), 야외주방
              </p>
            </div>
            <h4 className="rp-red-h4">어쩌고저쩌고 어쩌고저쩌고</h4>
          </div>
        </div>
        <div className="rp-right-section">
          <div className="rp-date-reservation">
            <h2>{productName}</h2>
            <div className="rp-date">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                minDate={new Date()}
              />
            </div>
          </div>
          {nights > 0 && (
            <div className="rp-price">
              <p>
                {nights}박 {formatDate(startDate)} ~ {formatDate(endDate)} <span>{totalProductPrice.toLocaleString()}원</span>
              </p>
              <div className="rp-person">
                <button onClick={() => handlePeopleCountChange(-1)}>-</button>
                <span>{peopleCount}명</span>
                <button onClick={() => handlePeopleCountChange(1)}>+</button>
              </div>
            </div>
          )}
          <div className="rp-option-description">
            <div className="rp-option">
              <h5>불멍 세트</h5>
              <img src="./images/다운로드 (1).jpg" alt="" />
              <ul>
                <li>
                  <p>불멍을 더욱 편리하게 이용하실 수 있습니다.</p>
                </li>
                <li>
                  <p>
                    푸른들 전용화로 + 장작 1망(10kg) + 착화탄 + 매직파이어(오로라가루) + 마시멜로우
                  </p>
                </li>
                <li>
                  <p>
                    체크인 시, 웰컴 센터에서 이용시간을 말씀해주시기 바랍니다(16:00 ~ 20:00 내 이용)
                  </p>
                </li>
                <li>
                  <p>장작은 함수율에 따라 g수가 상이할 수 있습니다</p>
                </li>
              </ul>
            </div>
            <div className="rp-option">
              <h5>숯불 세트</h5>
              <img src="./images/다운로드 (1).jpg" alt="" />
              <ul>
                <li>
                  <p>바베큐 이용 시 필수 입니다</p>
                </li>
                <li>
                  <p>푸른들 전용화로 + 숯 1봉 + 착화탄 + 그릴</p>
                </li>
              </ul>
            </div>
          </div>
          <div className="rp-option-choice">
            <select name="option" onChange={handleOptionChange}>
              <option value="">옵션 선택</option>
              {options.map((option) => (
                <option key={option.optionName} value={option.optionName}>
                  {option.optionName}
                </option>
              ))}
            </select>
            {Object.keys(selectedOptions).length > 0 && (
              <>
                {Object.keys(selectedOptions).map((optionName) => (
                  selectedOptions[optionName].count > 0 && (
                  <div key={optionName} className="rp-selected">
                    <h6>{optionName}</h6>
                    <p>
                      <button onClick={() => decreaseCount(optionName)}>-</button>
                      {selectedOptions[optionName].count || 0}개
                      <button onClick={() => increaseCount(optionName)}>+</button>
                      <span>
                        {(selectedOptions[optionName].count || 0) * (selectedOptions[optionName].price || 0)}원
                      </span>
                    </p>
                  </div>
                )))}
                <p className="rp-total-price">
                  총 가격: {totalPrice.toLocaleString()}원
                </p>
              </>
            )}
          </div>
          <div>
            <button
              className="rp-button"
              onClick={() =>
                openModal({
                  productName,
                  startDate,
                  endDate,
                  selectedOptions,
                  peopleCount,
                  totalPrice,
                })
              }
            >
              예약하기
            </button>
            <PaymentModal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              productDetails={productDetails}
              productName={productName}
              startDate={startDate}
              endDate={endDate}
              selectedOptions={selectedOptions}
              peopleCount={peopleCount}
              totalPrice={totalPrice}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>
    </>
  );
}
