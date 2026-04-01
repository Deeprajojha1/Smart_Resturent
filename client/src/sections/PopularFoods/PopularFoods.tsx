import type { CSSProperties } from "react";
import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import chholebhture from "../../assets/images/chholebhture.jpg";
import coffies from "../../assets/images/Coffies.jpg";
import dosa from "../../assets/images/Dosa.jpg";
import gulabjamun from "../../assets/images/Gulabjamun.jpg";
import indianThali from "../../assets/images/indianThali.jpg";
import momos from "../../assets/images/Momos.jpg";
import piza from "../../assets/images/piza.jpg";
import sandwich from "../../assets/images/Sandwich.jpg";
import southIndianthali from "../../assets/images/southIndianthali.jpg";
import speacialChiken from "../../assets/images/speacialChiken.jpg";

const foodCards = [
  { name: "Indian Thali", color: "142, 249, 252", image: indianThali },
  { name: "Chhole Bhature", color: "142, 252, 204", image: chholebhture },
  { name: "Masala Dosa", color: "142, 252, 157", image: dosa },
  { name: "South Indian Thali", color: "215, 252, 142", image: southIndianthali },
  { name: "Special Chicken", color: "252, 252, 142", image: speacialChiken },
  { name: "Margherita Pizza", color: "252, 208, 142", image: piza },
  { name: "Gulab Jamun", color: "252, 142, 142", image: gulabjamun },
  { name: "Grilled Sandwich", color: "252, 142, 239", image: sandwich },
  { name: "Steamed Momos", color: "204, 142, 252", image: momos },
  { name: "Special Coffee", color: "142, 202, 252", image: coffies },
];

const PopularFoods = () => {
  return (
    <section className="section-pad" id="popular">
      <Container>
        <SectionTitle
          eyebrow="Popular Foods"
          title="Our Popular Foods"
          subtitle="Signature dishes your guests keep coming back for."
          className="text-center"
        />
      </Container>
      <div className="popular-wrapper mt-12">
        <div
          className="popular-inner"
          style={{ "--quantity": foodCards.length } as CSSProperties}
        >
          {foodCards.map((card, index) => (
            <div
              key={card.name}
              className="popular-card"
              style={{
                "--index": index,
                "--color-card": card.color,
              } as CSSProperties}
            >
              <div
                className="popular-img"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <span className="popular-label">{card.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularFoods;
