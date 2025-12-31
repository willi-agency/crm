import express, { Express } from 'express';
import cors from './config/cors';
import publicCors from './config/publicCors';
import cookieParser from 'cookie-parser';
import { jsonErrorHandler } from './middlewares/jsonErrorHandler';
import authRoutes from './routes/authRoutes';
import enterpriseRoute from './routes/enterpriseRoute';
import apiKeyRoutes from './routes/apiKeyRoutes';
import userRoutes from './routes/userRoutes';
import blogCategoryRoutes from './routes/blogCategoryRoutes';
import blogTagRoutes from './routes/blogTagRoutes';
import blogAuthorRoutes from './routes/blog/blogAuthorRoutes';
import blogArticleRoutes from './routes/blogArticleRoutes';
import leadRoutes from './routes/leadRoutes';
import keywordPages from './routes/keywordPageRoutes';
import keywordPagesCategory from './routes/keywordPageCategoryRoutes';
import leadLabelForm from './routes/leadLabelForm';
import leadPipelineRoutes from './routes/lead/leadPipelineRoutes';
import userRoleRoutes from './routes/userRoleRoutes';
import ecommerceCategoryRoutes from './routes/ecommerceCategoryRoutes';
import mapCoverageRoutes from './routes/mapCoverageRoutes';
import leadPipelineStageRoutes from './routes/lead/leadPipelineStageRoutes';
import leadPublicRoutes from './routes/leadPublicRoutes';
import leadActivityRoutes from './routes/lead/leadActivityRoutes';
import { startLeadActivityCron } from './jobs/leadActivityCron';
import { errorHandler } from './middlewares/errorHandler';
import newBlogArticleRoutes from './routes/blog/newBlogArticleRoutes';
import enterpriseServiceRoutes from './routes/enterprise/enterpriseServiceRoutes';
import enterpriseContractRoutes from './routes/enterprise/enterpriseContractRoutes';
import utmSubmissionRoutes from './routes/campaign/utmSubmissionRoutes';
import blogTaxonomyRoutes from './routes/blog/blogTaxonomyRoutes';

const app: Express = express();

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rotas públicas com CORS liberado
app.use('/api/lead', publicCors, leadPublicRoutes);

// Rotas privadas para user e auth
app.use('/api/auth', cors, authRoutes);
app.use('/api/users', cors, userRoutes);
app.use('/api/users/roles', cors, userRoleRoutes);

// Rotas privadas para blog
app.use('/api/blog/categories', cors, blogCategoryRoutes);
app.use('/api/blog/tags', cors, blogTagRoutes);
app.use('/api/blog/authors', cors, blogAuthorRoutes);
app.use('/api/blog/articles', cors, blogArticleRoutes);
app.use('/api/blog/taxonomies', cors, blogTaxonomyRoutes);
app.use('/api/v2/blog/articles', cors, newBlogArticleRoutes);

// Rotas privadas para lead
app.use('/api/leads', cors, leadRoutes);
app.use('/api/leads/label', cors, leadLabelForm);
app.use('/api/leads/pipeline', cors, leadPipelineRoutes);
app.use('/api/leads/pipeline/stage', cors, leadPipelineStageRoutes);
app.use('/api/leads/activity', cors, leadActivityRoutes);

// Rotas privadas para conf da empresa
app.use('/api/apikeys', cors, apiKeyRoutes);
app.use('/api/keyword', cors, keywordPages);
app.use('/api/keyword/categories', cors, keywordPagesCategory);
app.use('/api/map/coverage', cors, mapCoverageRoutes);
app.use('/api/enterprises', cors, enterpriseRoute);
app.use('/api/enterprises/contracts', cors, enterpriseContractRoutes);
app.use('/api/enterprises/services', cors, enterpriseServiceRoutes);

// Rotas privadas para campanha
app.use('/api/campaign/utms', cors, utmSubmissionRoutes);

// Rotas privadas para ecommerce
app.use('/api/ecommerce/categories', cors, ecommerceCategoryRoutes);

app.use(errorHandler);
app.use(jsonErrorHandler);

startLeadActivityCron();

export default app;
