import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{
        width: "90%",
        height: "90%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000", // optional black background
      }}
    >
      <Image
        src="/zwolselopers.png"
        alt="ZwolseLopers"
        fill
        style={{ objectFit: "cover" }}
        priority
      />
    </main>
  );
}
