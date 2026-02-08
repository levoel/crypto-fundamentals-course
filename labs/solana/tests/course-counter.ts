import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CourseCounter } from "../target/types/course_counter";
import { expect } from "chai";

describe("course-counter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .CourseCounter as Program<CourseCounter>;

  const authority = provider.wallet;

  // Derive PDA for counter account
  const [counterPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), authority.publicKey.toBuffer()],
    program.programId
  );

  it("initializes the counter", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterPDA,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.counter.fetch(counterPDA);
    expect(account.count.toNumber()).to.equal(0);
    expect(account.authority.toString()).to.equal(
      authority.publicKey.toString()
    );
  });

  it("increments the counter", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterPDA,
        authority: authority.publicKey,
      })
      .rpc();

    const account = await program.account.counter.fetch(counterPDA);
    expect(account.count.toNumber()).to.equal(1);
  });

  it("increments again", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterPDA,
        authority: authority.publicKey,
      })
      .rpc();

    const account = await program.account.counter.fetch(counterPDA);
    expect(account.count.toNumber()).to.equal(2);
  });

  it("fails with wrong authority", async () => {
    const wrongAuthority = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
          authority: wrongAuthority.publicKey,
        })
        .signers([wrongAuthority])
        .rpc();

      expect.fail("Should have thrown error");
    } catch (err) {
      expect(err).to.be.instanceOf(Error);
    }
  });
});
