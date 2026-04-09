import type { CSSProperties } from "react";
import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import dosa from "../../assets/images/dosa.png";
import pizza from "../../assets/images/pizza.png";
import indianThali from "../../assets/images/indian-thali.png";
import specialChicken from "../../assets/images/special-chicken.png";
import paneer from "../../assets/images/panner.jpg";
import coffee from "../../assets/images/coffee.jpg";
import tea from "../../assets/images/tea.jpg";

const foodCards = [
  { name: "Indian Thali", color: "142, 249, 252", image: indianThali },
  { name: "Masala Dosa", color: "142, 252, 157", image: dosa },
  { name: "Special Chicken", color: "252, 252, 142", image: specialChicken },
  { name: "Margherita Pizza", color: "252, 208, 142", image: pizza },
  { name: "Paneer Butter Masala", color: "252, 142, 142", image: paneer },
  { name: "Special Coffee", color: "142, 202, 252", image: coffee },
  { name: "Masala Tea", color: "204, 142, 252", image: tea },
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
