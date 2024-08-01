"use client";

import { useEffect, useState } from "react";

import webAuthn, { client, server } from "@passwordless-id/webauthn";
import { Button, Input } from "antd";
import { useRouter } from "next/navigation";


export interface RegistrationEncoded {
  username: string;
  credential: CredentialKey;
  authenticatorData: string;
  clientData: string;
  attestationData?: string;
}

export interface CredentialKey {
  id: string;
  publicKey: string;
  algorithm: "RS256" | "ES256";
}

export default function Home() {
  const router = useRouter();
  const [registrationState, setRegistrationState] = useState<RegistrationEncoded>();
  const [challenge, setChallenge] = useState<Uint8Array>();
  const [challengeStr, setChallengeStr] = useState<string>();
  const [register, setRegister] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

   // 檢查 WebAuthn 客戶端是否可用
  const isAvailable = client.isAvailable();

  // 處理原生 WebAuthn 註冊

  const handleRegistration = async () => {
    // 模擬服務器要求的簽名訊息
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    setChallenge(challenge);

    console.log(' challenge: ',challenge )
    
    // 模擬註冊用戶 ID
    const userID = "Kodv9fPtkDoh4Oz7Yq/pVgWHS8HhdlCto5cR0aBoVMw=";
    const id = Uint8Array.from(window.atob(userID), (c) => c.charCodeAt(0));

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "WebAuthn Demo",
        id: "localhost",
      },
      user: {
        id,
        name: email,
        displayName: userName,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }], //"ES256" as registered in the IANA COSE Algorithms registry
      authenticatorSelection: {
      },
      timeout: 60000,
      attestation: "direct",
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    setRegister("LidoLee")

    console.log(" credential: ", credential);
  };

  const handleRegistrationPassless = async () => {
    const randomChallenge = webAuthn.utils.randomChallenge();
    setChallengeStr(randomChallenge);
    console.log(" randomChallenge: ", randomChallenge);

    // const RegistName = Date.now().toString();
    const registrationRes = await client.register(userName, randomChallenge, {
      userVerification: "required",
      authenticatorType: "auto",
      timeout: 60000,
      debug: false,
      userHandle: `${userName}`,
      attestation: false,
      discoverable: "preferred",
    });

    console.log("registrationRes : ", registrationRes);
    setRegistrationState(registrationRes);
  };

  const handleAuthenticate = async () => {
    const allCredentials = (await navigator.credentials.get({
      publicKey: {
        challenge: webAuthn.utils.toBuffer(webAuthn.utils.randomChallenge()),
        rpId: "localhost",
      },
    })) as PublicKeyCredential;
    // 簽完名後，把 signed message 送到後端做驗證...

    router.push("/login")

    console.log(" allCredentials: ", allCredentials);
  };

  const handleAuthenticatePassless = async () => {
    const randomChallenge = webAuthn.utils.randomChallenge();
    const authentication = await client.authenticate(
      [registrationState!.credential.id], // [registrationState!.credential.id],
      randomChallenge,
      {
        authenticatorType: "auto",
        userVerification: "required",
        timeout: 60000,
      }
    );
    // 簽完名後，把 signed message 送到後端做驗證...
    // 驗證 pass 後調轉頁面

    router.push("/login")

    console.log(" authentication: ", authentication);
  };

  const handleInputName = (e:any) =>{
   setUserName( e.target.value )
  }

  const handleInputEmail = (e:any) =>{
    setEmail( e.target.value )
   }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>{register != "" && <div> Register : {register}</div>}</div>
      <div className="flex"><span>Name : </span><Input style={{width: "250px"}} onChange={handleInputName}></Input></div>
      <div className="flex"><span>Email : </span><Input style={{width: "250px"}} onChange={handleInputEmail}></Input></div>
      <div className="text-2xl mb-2">Webauthn origin api</div>
      <Button className="mb-4" onClick={handleRegistration}>
        Regist
      </Button>
      <Button className="mb-4" onClick={handleAuthenticate}>
        Authenticate
      </Button>
      <br></br>
      <div className="text-2xl mb-2">passwordless-id api</div>
      <Button className="mb-4" onClick={handleRegistrationPassless}>
        Regist
      </Button>
      <Button className="mb-4" onClick={handleAuthenticatePassless}>
        Authenticate
      </Button>
    </main>
  );
}
