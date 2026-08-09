import { Container } from "@stackleo/ui";

const VALUE_PROPS = [
  { title: "Fast Shipping", description: "Reliable delivery on every order." },
  { title: "Secure Payments", description: "Your transactions are protected." },
  { title: "Verified Sellers", description: "Every listing is vetted for quality." },
  { title: "Dedicated Support", description: "Help is always within reach." },
];

export function ValueProps() {
  return (
    <section aria-label="Why shop with StackLeo" className="border-b border-neutral-200 bg-white">
      <Container className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
        {VALUE_PROPS.map((prop) => (
          <div key={prop.title}>
            <h3 className="text-sm font-semibold text-neutral-900">{prop.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{prop.description}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
