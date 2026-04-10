import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";
import AppButton from "../components/ui/AppButton";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <LanguageSwitcher compact />
        </Box>

        <SectionCard>
          <Stack spacing={2}>
            <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              {t("home.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("home.subtitle")}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <AppButton onClick={() => navigate(user ? "/dashboard" : "/register")}>
                {t("home.ctaPrimary")}
              </AppButton>
              <AppButton variant="ghost" onClick={() => navigate("/login")}>
                {t("home.ctaSecondary")}
              </AppButton>
            </Stack>
          </Stack>
        </SectionCard>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <SectionCard title={t("home.feature1Title")}>
            <Typography color="text.secondary">{t("home.feature1Body")}</Typography>
          </SectionCard>
          <SectionCard title={t("home.feature2Title")}>
            <Typography color="text.secondary">{t("home.feature2Body")}</Typography>
          </SectionCard>
          <SectionCard title={t("home.feature3Title")}>
            <Typography color="text.secondary">{t("home.feature3Body")}</Typography>
          </SectionCard>
        </Box>

        <SectionCard title={t("home.aiTitle")}>
          <Typography color="text.secondary">{t("home.aiBody")}</Typography>
        </SectionCard>

        <SectionCard title={t("home.screenshotsTitle")}>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            {t("home.screenshotsBody")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            {[
              { title: "Dashboard", src: "/dashboard-screenshot.png" },
              { title: "Food Search", src: "/search-food-screenshot.png" },
            ].map((item) => (
              <Box
                key={item.title}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.1)",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={item.src}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: { xs: 180, md: 220 },
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Stack>
    </PageShell>
  );
};

export default Home;
