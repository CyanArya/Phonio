"use client";
import Link from "next/link";
import React, { useState } from "react";
// to:
import styles from "./Navbar.module.css"; // You'll need to rename your CSS file
import Image from "next/image";
import VideoCall from "../videocall/VideoCall";

const Navbar = () => {
  const [showCall, setShowCall] = useState(false);

  const handleCloseCall = () => {
    setShowCall(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container + " " + styles["no-pad"]}>
        <nav className={styles["nav-row"]}>
          <div className={styles["nav-inner"]}>
            <Link href="/" className={styles["nav-logo-row"]}>
              <Image src={"/images/logo.svg"} height={20} width={55} alt="logo" />
              <Image src={"/images/dash_side_logo_icon.svg"} height={20} width={55} alt="logo" />
            </Link>
            <div className={styles["nav-menu"]}>
              <div className={styles["nav-menu__links"]}>
                <Link href={"/"} className={`${styles.link} ${styles["nav-link"]} ${styles["w-inline-block"]} ${styles["w--current"]}`}>
                  <p className={styles["nav-link-text"]}>Home</p>
                </Link>
                <Link href={"/"}>Pricing</Link>
                <Link href={"/"}>Updates</Link>
                <Link href={"/"}>FAQ</Link>
              </div>
            </div>
            <div className={styles["nav-button-row"]}>
              <Link href={"/"}>Log in</Link>
              <Link href={"/"} className={`${styles.button} ${styles.small} ${styles["w-inline-block"]}`}>
                <div className={styles["u--clip"]}>
                  <p>Get started</p>
                </div>
                <div className={styles["button-bg"]}></div>
              </Link>
              <button className={styles["menu-button"]}>
                <Image src={"/images/menu_button__icon.svg"} className={styles["menu-button__icon"]} height={40} width={40} alt="toggle"/>
                <div className={styles["button-bg"]}></div>
              </button>
              <button 
                className={`${styles["join-call-button"]} ${showCall ? styles.active : ''}`} 
                onClick={() => setShowCall(!showCall)}
              >
                {showCall ? 'End Call' : 'Join Call'}
              </button>
            </div>
          </div>
        </nav>
      </div>
      {showCall && <VideoCall onClose={handleCloseCall} />}
    </header>
  );
};

export default Navbar;