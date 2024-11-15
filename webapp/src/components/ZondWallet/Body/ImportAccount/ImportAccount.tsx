import { Button } from "../../../UI/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../UI/Card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../../../UI/Form";
import { Input } from "../../../UI/Input";
import { getHexSeedFromMnemonic } from "../../../../functions/getHexSeedFromMnemonic";
import withSuspense from "../../../../functions/withSuspense";
import { useStore } from "../../../../stores/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Web3BaseWalletAccount } from "@theqrl/web3";
import { Download, Loader } from "lucide-react";
import { observer } from "mobx-react-lite";
import { lazy, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MnemonicWordListing = withSuspense(
  lazy(() =>
    import("../CreateAccount/MnemonicDisplay/MnemonicWordListing/MnemonicWordListing")
  )
);
const AccountImportSuccess = withSuspense(
  lazy(() => import("./AccountImportSuccess/AccountImportSuccess"))
);

const FormSchema = z.object({
  mnemonicPhrases: z.string().min(1, "Mnemonic phrases are required"),
});

const ImportAccount = observer(() => {
  const [account, setAccount] = useState<Web3BaseWalletAccount>();
  const [hasAccountImported, setHasAccountImported] = useState(false);
  const { zondStore } = useStore();
  const { zondInstance, setActiveAccount } = zondStore;

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    try {
      const account = zondInstance?.accounts.seedToAccount(
        getHexSeedFromMnemonic(formData.mnemonicPhrases.trim())
      );
      if (account) {
        window.scrollTo(0, 0);
        setAccount(account);
        await setActiveAccount(account.address);
        setHasAccountImported(true);
      } else {
        control.setError("mnemonicPhrases", {
          message: "Account could not be imported from the mnemonic phrases",
        });
      }
    } catch (error) {
      control.setError("mnemonicPhrases", {
        message: `There was an error while reading the mnemonic phrases. ${error}`,
      });
    }
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      mnemonicPhrases: "",
    },
  });
  const {
    handleSubmit,
    watch,
    control,
    formState: { isSubmitting, isValid },
  } = form;

  return (
    <>
      <img
        className="fixed z-0 h-96 w-96 -translate-x-8 scale-150 overflow-hidden opacity-30"
        src="/tree.svg"
        alt="Background Tree"
      />
      <div className="relative z-10 p-8">
        {hasAccountImported ? (
          <AccountImportSuccess account={account} />
        ) : (
          <Form {...form}>
            <form
              name="importAccount"
              aria-label="importAccount"
              className="w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Import an existing account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <FormField
                    control={control}
                    name="mnemonicPhrases"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            aria-label={field.name}
                            autoComplete="off"
                            disabled={isSubmitting}
                            placeholder="Mnemonic Phrases"
                          />
                        </FormControl>
                        <FormDescription>
                          Paste the mnemonic phrases
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <MnemonicWordListing mnemonic={watch().mnemonicPhrases} />
                </CardContent>
                <CardFooter>
                  <Button
                    disabled={isSubmitting || !isValid}
                    className="w-full"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Import account
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}
      </div>
    </>
  );
});

export default ImportAccount;