'use client'

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Interests from './Interests';
import PreInterests from './PreInterests';

export default function Home() {
  // const [isModalOpen, setModalOpen] = useState(false);

  // useEffect(() => {
  //   const savedInterests = Cookies.get('interests');
  //   if (!savedInterests) {
  //     setModalOpen(true);
  //   }
  // }, []);

  // const closeModal = () => {
  //   setModalOpen(false);
  // };

  return (
    <>
      {/* {isModalOpen && <PreInterests onClose={closeModal} />} */}
      <Interests />
    </>
  );
}